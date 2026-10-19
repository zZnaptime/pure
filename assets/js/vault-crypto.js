/* ══════════════════════════════════════════════════════════════
   SYRINGE — 프롬프트 보관함 암호화 (사이트 · 관리 화면 공통)

   · 저장소에는 암호문만 올라가요. 비밀번호 · 프롬프트 · 사진 원본은
     코드에도, 저장소에도 없어요.
   · 비밀번호 → PBKDF2-SHA256 (60만 번) → AES-GCM 256 키
   · vault/vault.json : 페어 · 프롬프트 (암호문)
     vault/img/*.bin   : 사진 (암호문, 이름도 무작위)
   · 비밀번호가 틀리면 복호화 자체가 실패해요 (AES-GCM 인증).
══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var C = (window.crypto || {}).subtle;
  var ITER = 600000;

  function u8(b){ return b instanceof Uint8Array ? b : new Uint8Array(b); }
  function b64(buf){ var a = u8(buf), s = '', K = 0x8000; for (var i = 0; i < a.length; i += K) s += String.fromCharCode.apply(null, a.subarray(i, i + K)); return btoa(s); }
  function unb64(s){ var t = atob(s), a = new Uint8Array(t.length); for (var i = 0; i < t.length; i++) a[i] = t.charCodeAt(i); return a; }
  function rand(n){ var a = new Uint8Array(n); crypto.getRandomValues(a); return a; }
  function randId(){ return Array.prototype.map.call(rand(12), function(x){ return (x < 16 ? '0' : '') + x.toString(16); }).join(''); }

  function ready(){
    if (!C) return Promise.reject(new Error('이 브라우저(또는 http 주소)에서는 암호화 사용이 불가능합니다. https 주소로 열어 주세요.'));
    return Promise.resolve();
  }
  /* 비밀번호 → 키 */
  function deriveKey(pw, saltB64, iter){
    return ready().then(function(){
      return C.importKey('raw', new TextEncoder().encode(String(pw).normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
    }).then(function(base){
      return C.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: unb64(saltB64), iterations: iter || ITER }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  /* 바이트 암호화 : 결과 = iv(12) + 암호문 */
  function encBytes(key, bytes){
    var iv = rand(12);
    return C.encrypt({ name: 'AES-GCM', iv: iv }, key, u8(bytes)).then(function(ct){
      var out = new Uint8Array(12 + ct.byteLength); out.set(iv, 0); out.set(new Uint8Array(ct), 12); return out;
    });
  }
  function decBytes(key, bytes){
    var a = u8(bytes);
    return C.decrypt({ name: 'AES-GCM', iv: a.subarray(0, 12) }, key, a.subarray(12)).then(function(p){ return new Uint8Array(p); });
  }

  /* 보관함 파일 열기 : 틀린 비밀번호면 reject({bad:true}) */
  function open(file, pw){
    if (!file || !file.kdf || !file.ct) return Promise.reject(new Error('보관함 파일이 비어 있습니다.'));
    var key;
    return deriveKey(pw, file.kdf.salt, file.kdf.iter).then(function(k){
      key = k; return decBytes(k, unb64(file.ct));
    }).then(function(p){
      return { key: key, kdf: file.kdf, data: JSON.parse(new TextDecoder().decode(p)) };
    }, function(e){
      if (e && e.name === 'OperationError') { var x = new Error('비밀번호가 틀렸습니다.'); x.bad = true; throw x; }
      throw e;
    });
  }
  /* 보관함 파일 만들기 (key 를 주면 그 키로, 아니면 pw 로 새 키) */
  function seal(data, key, kdf){
    return encBytes(key, new TextEncoder().encode(JSON.stringify(data))).then(function(ct){
      return { v: 1, kdf: kdf, ct: b64(ct) };
    });
  }
  function newKey(pw){
    var kdf = { alg: 'PBKDF2-SHA256', iter: ITER, salt: b64(rand(16)) };
    return deriveKey(pw, kdf.salt, kdf.iter).then(function(key){ return { key: key, kdf: kdf }; });
  }

  window.SYV = { open: open, seal: seal, newKey: newKey, encBytes: encBytes, decBytes: decBytes, b64: b64, unb64: unb64, randId: randId, ITER: ITER };
})();
