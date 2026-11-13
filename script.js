
    var currentSlide = 1;
    var hasKnife = false;
    var hasRailgun = false;
    var hasStellar = false;
    var unlocked = { 11: false, 12: false, 13: false, 14: false };
    var aimMode = false;
    var blastRadius = 350;
    var audioOn = true;
    var audioCtx = null;
    var owlTimer = null;
    var owlCharge = 0;

    var slideNames = {
      1: "Sivu 1: Virallinen kutsukirje (Timin numero +358 44 9854292)",
      2: "Sivu 2: Mikä on O-järjestö? (yritysjarjesto-c84810.webnode.fi)",
      3: "Sivu 3: Raportit & Kuukausikokoukset (25.10. & 14.11.2026)",
      4: "Sivu 4: 4K Tonnikala — Klikkaa niin se raivostuu ja murenee!",
      5: "Sivu 5: O.järjestön 11 yhtiötä + Salapaikka (Salainen Veitsi)",
      6: "Sivu 6: iPhone 18 Pro Max (4K Titanium)",
      7: "Sivu 7: Sammen kaviaari (Mustaa kultaa)",
      8: "Sivu 8: Höh öö – Viesti kalkkunan sisältä!",
      9: "Sivu 9: Kattava yhteenveto",
      10: "Sivu 10: Iso kala (Klikkaa veitsellä ▶ Sivu 11)",
      11: "Salainen Sivu 11: Kalkkunan rituaali & 4K Orbital Railgun",
      12: "Salainen Sivu 12: Salainen Kirjasto — Norsu & Stellar Remote",
      13: "Salainen Sivu 13: Pöllöjen Torni (Korjaa ▶ Sivu 14)",
      14: "Salainen Sivu 14: Fotorealistinen 3D Pöllöjen Linna & Kartta"
    };

    // High-Resolution 4K Wallpapers per Slide
    var slideWallpapers = {
      1: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2000&q=85",
      2: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85",
      3: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=85",
      4: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2000&q=85",
      5: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85",
      6: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=2000&q=85",
      7: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=85",
      8: "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?auto=format&fit=crop&w=2000&q=85",
      9: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=85",
      10: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=2000&q=85",
      11: "https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?auto=format&fit=crop&w=2000&q=85",
      12: "https://images.unsplash.com/photo-1507842229356-51c61504d3ab?auto=format&fit=crop&w=2000&q=85",
      13: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=2000&q=85",
      14: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2000&q=85"
    };

    function showToast(text) {
      var t = document.getElementById('toastBox');
      if (!t) return;
      t.textContent = text;
      t.style.display = 'block';
      clearTimeout(window._tTimer);
      window._tTimer = setTimeout(function() { t.style.display = 'none'; }, 3600);
    }

    function playSound(f1, f2, dur, wave) {
      if (!audioOn) return;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!audioCtx && AC) audioCtx = new AC();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = wave || 'sawtooth';
        osc.frequency.setValueAtTime(f1, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(Math.max(22, f2), audioCtx.currentTime + dur);
        gain.gain.setValueAtTime(0.24, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
      } catch (e) {}
    }

    function buildDots() {
      var bar = document.getElementById('dotsBar');
      if (!bar) return;
      bar.innerHTML = '';
      for (var i = 1; i <= 14; i++) {
        (function(idx) {
          var b = document.createElement('button');
          var isSec = idx >= 11;
          var isOpen = !isSec || unlocked[idx];
          b.className = 'dot-btn' + (idx === currentSlide ? ' active' : (isSec && isOpen ? ' secret-open' : ''));
          b.textContent = isSec ? (idx + (isOpen ? ' 🔓' : ' 🔒')) : String(idx);
          b.onclick = function() {
            if (isSec && !unlocked[idx]) unlocked[idx] = true;
            window.goToSlide(idx);
          };
          bar.appendChild(b);
        })(i);
      }
    }

    window.goToSlide = function(n) {
      if (n < 1 || n > 14) return;
      clearInterval(owlTimer);
      var tor = document.getElementById('tornadoOverlay');
      if (tor) tor.style.opacity = '1';
      playSound(240, 720, 0.22, 'sine');

      var bgLayer = document.getElementById('dynamicBgLayer');
      if (bgLayer && slideWallpapers[n]) {
        bgLayer.style.backgroundImage = "url('" + slideWallpapers[n] + "')";
      }

      setTimeout(function() {
        for (var i = 1; i <= 14; i++) {
          var el = document.getElementById('slide-' + i);
          if (el) el.classList.toggle('active', i === n);
        }
        currentSlide = n;
        document.getElementById('pageIndicator').textContent = 'Sivu ' + n + ' / 14';
        document.getElementById('topSub').textContent = slideNames[n] || '';
        buildDots();
        if (n === 11) startOwlChargeLoop();
        if (n === 14) resize3DCanvas();
      }, 120);

      setTimeout(function() {
        if (tor) tor.style.opacity = '0';
      }, 320);
    };

    window.nextSlide = function() {
      var nxt = currentSlide + 1;
      if (nxt <= 14) {
        if (nxt >= 11) unlocked[nxt] = true;
        window.goToSlide(nxt);
      } else {
        window.goToSlide(1);
      }
    };

    window.prevSlide = function() {
      if (currentSlide > 1) window.goToSlide(currentSlide - 1);
    };

    window.toggleAudio = function() {
      audioOn = !audioOn;
      document.getElementById('audioIcon').textContent = audioOn ? '🔊' : '🔇';
      showToast(audioOn ? '🔊 4K Äänet päällä' : '🔇 Äänet mykistetty');
    };

    // ==========================================
    // SLIDE 4: 4K REAL PHOTO TUNA SHATTER INTO 48 PHOTO SHARDS
    // ==========================================
    var tunaShattered = false;
    window.clickTuna = function(e) {
      if (e) e.stopPropagation();
      if (tunaShattered) return;
      tunaShattered = true;
      var w = document.getElementById('tunaWrap');
      var st = document.getElementById('tunaStatus');
      w.classList.add('enraged');
      st.textContent = '😡 TONNIKALA RAIVOSTUU!! KOHTA SE MURENEE PALASIKSI!!';
      st.style.color = '#ef4444';
      playSound(190, 45, 0.45, 'sawtooth');

      setTimeout(function() {
        var r = w.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        w.style.opacity = '0';
        w.classList.remove('enraged');
        st.textContent = '💥 POKS! Tonnikala mureni 48 oikeaksi valokuvapalaseksi! Klikkaa ylhäältä ”Kokoa tonnikala”.';
        playSound(130, 25, 0.65, 'square');

        var fx = document.getElementById('orbital-fx-layer');
        for (var i = 0; i < 48; i++) {
          var sh = document.createElement('div');
          sh.className = 'photo-shard';
          var sw = 28 + Math.random() * 36;
          var shh = 24 + Math.random() * 32;
          sh.style.width = sw + 'px';
          sh.style.height = shh + 'px';
          sh.style.left = cx + 'px';
          sh.style.top = cy + 'px';
          sh.style.backgroundPosition = (-Math.floor(Math.random() * 260)) + 'px ' + (-Math.floor(Math.random() * 160)) + 'px';
          fx.appendChild(sh);
          var ang = Math.random() * Math.PI * 2;
          var dist = 80 + Math.random() * 360;
          sh.animate([
            { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
            { transform: 'translate(calc(-50% + ' + (Math.cos(ang)*dist) + 'px), calc(-50% + ' + (Math.sin(ang)*dist) + 'px)) scale(0.1) rotate(' + ((Math.random()-0.5)*720) + 'deg)', opacity: 0 }
          ], { duration: 920, fill: 'forwards' });
          setTimeout(function(el) { try { el.remove(); } catch (err) {} }, 960, sh);
        }
      }, 680);
    };

    window.resetTuna = function(e) {
      if (e) e.stopPropagation();
      tunaShattered = false;
      var w = document.getElementById('tunaWrap');
      var st = document.getElementById('tunaStatus');
      w.style.opacity = '1';
      w.classList.remove('enraged');
      st.textContent = '👆 KLIKKAA TONNIKALAA! Se raivostuu ja murenee 48 oikeaksi valokuvapalaseksi!';
      st.style.color = '#67e8f9';
    };

    // ==========================================
    // SLIDE 5 & 10: SECRET KNIFE & GIANT FISH
    // ==========================================
    window.findKnife = function() {
      hasKnife = true;
      unlocked[11] = true;
      playSound(340, 980, 0.35, 'triangle');
      document.getElementById('knifeIcon').textContent = '🔪';
      document.getElementById('knifeLabel').textContent = 'Veitsi VALMIS!';
      document.getElementById('badgeKnife').className = 'pill-btn gold';
      document.getElementById('knifeBoxTitle').textContent = '🔪 Salainen Veitsi löydetty!';
      document.getElementById('knifeBoxSub').textContent = 'Mene nyt Sivulle 10 ja klikkaa Isoa Kalaa!';
      var fk = document.getElementById('fishKnifeStatus');
      if (fk) {
        fk.textContent = '🔪 Veitsi mukana: Klikkaa Isoa Kalaa ▶ Sivu 11!';
        fk.className = 'pill-btn emerald';
      }
      buildDots();
      showToast('🔪 LÖYSIT SALAISEN VEITSEN! Klikkaa nyt Sivun 10 Isoa Kalaa!');
    };

    window.clickKnifeBadge = function() {
      if (!hasKnife) window.findKnife();
      window.goToSlide(5);
    };

    window.clickGiantFish = function() {
      if (!hasKnife) {
        playSound(110, 25, 0.7, 'sawtooth');
        showDeathModal('🦈🦷', 'ISO KALA SÖI SINUT! LOPPU!', 'Klikkasit Isoa Kalaa ilman Sivun 5 salapaikan veistä!', '💡 Vinkki: Hae Veitsi Sivulta 5 (tai klikkaa yläpalkin Veitsi-nappia) ja klikkaa kalaa uudelleen!');
      } else {
        unlocked[11] = true;
        playSound(380, 1120, 0.4, 'triangle');
        showToast('🔪 KUKISTIT ISON KALAN VEITSELLÄ! Salainen Sivu 11 avautuu!');
        window.goToSlide(11);
      }
    };

    // ==========================================
    // SLIDE 11: TURKEY RITUAL & 4K ORBITAL RAILGUN
    // ==========================================
    function startOwlChargeLoop() {
      clearInterval(owlTimer);
      owlCharge = 0;
      var txt = document.getElementById('owlChargeText');
      var fill = document.getElementById('owlChargeFill');
      owlTimer = setInterval(function() {
        if (currentSlide !== 11 || hasRailgun) { clearInterval(owlTimer); return; }
        owlCharge += 4;
        if (txt) txt.textContent = 'Lataus: ' + owlCharge + '%';
        if (fill) fill.style.width = owlCharge + '%';
        if (owlCharge >= 100) {
          clearInterval(owlTimer);
          spawnOrbitalBeamFX(window.innerWidth / 2, window.innerHeight / 2, blastRadius);
          setTimeout(function() {
            showDeathModal('🦉🛰️', 'KUOLIT! (Orbital Railgun Mod)', 'Pöllö ampui sinua avaruudesta 4K Orbital Railgunilla!', '💡 Vinkki: Klikkaa Pöllöä ennen kuin lataus saavuttaa 100%, niin kaappaat Orbital Railgunin itsellesi!');
          }, 820);
        }
      }, 220);
    }

    window.clickOwl = function(e) {
      if (e) e.stopPropagation();
      clearInterval(owlTimer);
      hasRailgun = true;
      playSound(320, 1240, 0.4, 'triangle');
      document.getElementById('railgunIcon').textContent = '🛰️';
      document.getElementById('railgunLabel').textContent = 'Orbital Railgun VALMIS!';
      document.getElementById('badgeRailgun').className = 'pill-btn cyan';
      document.getElementById('weaponBar').classList.add('open');
      document.getElementById('s11Status').textContent = '✅ KAAPPASIT 4K ORBITAL RAILGUNIN! Klikkaa nyt vasemmanpuoleista Kalkkunaa ampuaksesi sitä kesken rituaalin ▶ Sivu 12!';
      showToast('🛰️ SAIT 4K ORBITAL RAILGUNIN! Voit ampua dioja oikealla hiirellä tai yläpalkin napista!');
    };

    window.clickRailgunBadge = function() {
      if (!hasRailgun) window.clickOwl();
      else document.getElementById('weaponBar').classList.toggle('open');
    };

    window.shootTurkey = function(e) {
      if (e) e.stopPropagation();
      if (!hasRailgun) window.clickOwl();
      unlocked[12] = true;
      spawnOrbitalBeamFX(window.innerWidth / 3, window.innerHeight / 2, blastRadius);
      showToast('🌌 AMMUIT KALKKUNAN KESKEN RITUAALIN! Salainen Sivu 12 (Salainen Kirjasto) avautuu!');
      setTimeout(function() { window.goToSlide(12); }, 820);
    };

    // ==========================================
    // 4K ORBITAL RAILGUN, BLAST HOLES & STELLAR REMOTE
    // ==========================================
    window.updateBlastRadius = function(v) {
      blastRadius = parseInt(v, 10) || 350;
      document.getElementById('radiusLabel').textContent = blastRadius + ' px';
    };

    window.toggleAimMode = function() {
      if (!hasRailgun) window.clickOwl();
      aimMode = !aimMode;
      document.body.classList.toggle('aim-mode', aimMode);
      document.getElementById('aimToggleBtn').textContent = aimMode ? '🎯 TÄHTÄYS PÄÄLLÄ (Klikkaa kohdetta!)' : '🎯 Tähtää & Ammu (tai Oikea hiiri)';
    };

    function spawnParticles(cx, cy, colors, count, maxDist) {
      var fx = document.getElementById('orbital-fx-layer');
      if (!fx) return;
      for (var i = 0; i < count; i++) {
        var p = document.createElement('div');
        var sz = 10 + Math.random() * 24;
        var poly = i % 2 === 0
          ? 'polygon(18% 0%, 88% 8%, 100% 74%, 64% 100%, 8% 84%, 0% 26%)'
          : 'polygon(10% 12%, 92% 0%, 86% 90%, 15% 100%)';
        p.style.cssText = 'position:fixed;width:' + sz + 'px;height:' + sz + 'px;left:' + cx + 'px;top:' + cy + 'px;background:' + colors[i % colors.length] + ';clip-path:' + poly + ';pointer-events:none;box-shadow:inset -3px -3px 6px rgba(0,0,0,0.65), 0 0 12px ' + colors[0] + ';';
        fx.appendChild(p);
        var ang = Math.random() * Math.PI * 2;
        var d = 40 + Math.random() * maxDist;
        var tx = Math.cos(ang) * d;
        var ty = Math.sin(ang) * d * 0.65;
        var fallY = ty + 180 + Math.random() * 240;
        var rot = (Math.random() - 0.5) * 920;
        p.animate([
          { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
          { transform: 'translate(calc(-50% + ' + (tx * 0.6) + 'px), calc(-50% + ' + (ty - 45) + 'px)) scale(0.95) rotate(' + (rot * 0.45) + 'deg)', opacity: 0.95, offset: 0.35 },
          { transform: 'translate(calc(-50% + ' + tx + 'px), calc(-50% + ' + fallY + 'px)) scale(0.15) rotate(' + rot + 'deg)', opacity: 0 }
        ], { duration: 920 + Math.random() * 380, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'forwards' });
        setTimeout(function(el) { try { el.remove(); } catch (err) {} }, 1350, p);
      }
    }

    function spawnOrbitalBeamFX(x, y, rad) {
      playSound(240, 26, 0.9, 'sawtooth');
      var body = document.getElementById('appBody');
      body.classList.add('quake');
      setTimeout(function() { body.classList.remove('quake'); }, 600);

      var fx = document.getElementById('orbital-fx-layer');
      var wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:56;';
      fx.appendChild(wrap);
      setTimeout(function() { try { wrap.remove(); } catch (e) {} }, 880);

      var bw = Math.max(50, Math.round(rad * 0.38));
      var beam = document.createElement('div');
      beam.style.cssText = 'position:absolute;top:0;bottom:0;left:' + x + 'px;width:' + bw + 'px;transform:translateX(-50%);background:linear-gradient(90deg,transparent,#ef4444,#38bdf8,#ffffff,#38bdf8,#ef4444,transparent);box-shadow:0 0 75px #38bdf8,0 0 130px #ef4444;';
      wrap.appendChild(beam);
      beam.animate([
        { opacity: 0, transform: 'translateX(-50%) scaleX(0.1)' },
        { opacity: 1, transform: 'translateX(-50%) scaleX(1.3)', offset: 0.2 },
        { opacity: 0, transform: 'translateX(-50%) scaleX(0.02)' }
      ], { duration: 840, fill: 'forwards' });

      var ring = document.createElement('div');
      ring.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + (rad*1.8) + 'px;height:' + (rad*1.8) + 'px;transform:translate(-50%,-50%);border-radius:50%;border:5px solid #fde047;box-shadow:0 0 50px #38bdf8;';
      wrap.appendChild(ring);
      ring.animate([
        { opacity: 1, transform: 'translate(-50%,-50%) scale(0.08)' },
        { opacity: 0, transform: 'translate(-50%,-50%) scale(1.06)' }
      ], { duration: 800, fill: 'forwards' });

      spawnParticles(x, y, ['#38bdf8', '#ffffff', '#ef4444', '#fde047'], 34, rad);

      var holes = document.getElementById('holesLayer');
      if (holes && currentSlide !== 14) {
        var h = document.createElement('div');
        h.className = 'blast-hole';
        var hSize = Math.max(50, Math.min(170, Math.round(rad * 0.35)));
        h.style.width = hSize + 'px';
        h.style.height = hSize + 'px';
        h.style.left = x + 'px';
        h.style.top = y + 'px';
        holes.appendChild(h);
      }

      var slideEl = document.getElementById('slide-' + currentSlide);
      if (slideEl) {
        slideEl.querySelectorAll('.destructible').forEach(function(card) {
          var r = card.getBoundingClientRect();
          var dist = Math.hypot((r.left + r.width/2) - x, (r.top + r.height/2) - y);
          if (dist <= rad * 1.15) {
            card.classList.add('orbital-damaged');
            var dx = ((Math.random() - 0.5) * 32).toFixed(1);
            var dy = (6 + Math.random() * 20).toFixed(1);
            var rot = ((Math.random() - 0.5) * 12).toFixed(1);
            card.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg)';
          }
        });
      }
    }

    window.fireOrbitalBtn = function() {
      if (currentSlide === 11) { window.shootTurkey(); return; }
      if (currentSlide === 13) { window.shootOwlTower(); return; }
      if (currentSlide === 14) { window.shoot3D(); return; }
      spawnOrbitalBeamFX(window.innerWidth / 2, window.innerHeight / 2, blastRadius);
    };

    window.addEventListener('contextmenu', function(e) {
      if (!hasRailgun || currentSlide === 14) return;
      e.preventDefault();
      spawnOrbitalBeamFX(e.clientX, e.clientY, blastRadius);
    });

    window.addEventListener('click', function(e) {
      if (!aimMode) return;
      if (e.target.closest('header') || e.target.closest('footer')) return;
      e.stopPropagation();
      aimMode = false;
      document.body.classList.remove('aim-mode');
      document.getElementById('aimToggleBtn').textContent = '🎯 Tähtää & Ammu (tai Oikea hiiri)';
      spawnOrbitalBeamFX(e.clientX, e.clientY, blastRadius);
    }, true);

    // ==========================================
    // SLIDE 12: ELEPHANT & STELLAR REMOTE
    // ==========================================
    window.stealStellarRemote = function(e) {
      if (e) e.stopPropagation();
      hasRailgun = true;
      hasStellar = true;
      unlocked[13] = true;
      playSound(420, 1380, 0.4, 'triangle');
      document.getElementById('stellarIcon').textContent = '📡';
      document.getElementById('stellarLabel').textContent = 'Stellar Remote VALMIS!';
      document.getElementById('badgeStellar').className = 'pill-btn purple';
      document.getElementById('weaponBar').classList.add('open');
      buildDots();
      showToast('📡 VARASTIT NORSUN STELLAR REMOTEN! Maailmankaikkeuden Salaisin Sivu 13 (Pöllöjen Torni) avautuu!');
      setTimeout(function() { window.goToSlide(13); }, 680);
    };

    window.clickStellarBadge = function() {
      if (!hasStellar) window.stealStellarRemote();
      else document.getElementById('weaponBar').classList.toggle('open');
    };

    window.elephantAttack = function() {
      spawnOrbitalBeamFX(window.innerWidth / 2, window.innerHeight / 2, 500);
      setTimeout(function() {
        showDeathModal('🐘🕳️', 'KUOLIT! (Gravitia SS6 • Shooting Star Mod)', 'Kosminen Norsu imaisi sinut Gravitia SS6 -mustaan aukkoon!', '💡 Vinkki: Klikkaa ”Varasta Norsun Stellar Remote” päästäksesi Sivulle 13!');
      }, 820);
    };

    window.fireStellarPower = function(type) {
      if (currentSlide === 13) { window.shootOwlTower(); return; }
      if (currentSlide === 14) { window.set3DWeapon(2); window.shoot3D(); return; }
      spawnOrbitalBeamFX(window.innerWidth / 2, window.innerHeight / 2, type === 'supernova' ? 650 : blastRadius);
      showToast('📡 STELLAR REMOTE: ' + type.toUpperCase() + ' laukaistu!');
    };

    // ==========================================
    // STELLAR REMOTE: "KORJAUS" -> UNLOCKS SLIDE 14 ON SLIDE 13
    // ==========================================
    window.triggerRepairAll = function() {
      playSound(320, 1280, 0.5, 'sine');
      var fx = document.getElementById('orbital-fx-layer');
      var wave = document.createElement('div');
      wave.style.cssText = 'position:fixed;left:50%;top:50%;width:90px;height:90px;transform:translate(-50%,-50%);border-radius:50%;border:6px solid #10b981;background:radial-gradient(circle,rgba(16,185,129,0.38),transparent 70%);box-shadow:0 0 80px #10b981;pointer-events:none;';
      fx.appendChild(wave);
      wave.animate([
        { transform: 'translate(-50%,-50%) scale(0.2)', opacity: 1 },
        { transform: 'translate(-50%,-50%) scale(24)', opacity: 0 }
      ], { duration: 780, fill: 'forwards' });
      setTimeout(function() { try { wave.remove(); } catch (e) {} }, 820);

      var holes = document.getElementById('holesLayer');
      if (holes) holes.innerHTML = '';

      document.querySelectorAll('.orbital-damaged').forEach(function(el) {
        el.classList.remove('orbital-damaged');
        el.style.transform = '';
      });

      if (currentSlide === 13) {
        unlocked[14] = true;
        var tb = document.getElementById('towerBanner');
        if (tb) {
          tb.style.background = '#10b981';
          tb.textContent = '✨ PÖLLÖTORNI KORJATTU! PORTTI FOTOREALISTISEEN 3D PÖLLÖJEN LINNAAN (SIVU 14) AUKEAA! ✨';
        }
        buildDots();
        showToast('🏰✨ KORJASIT PÖLLÖTORNIN! Salainen Sivu 14 (Fotorealistinen 3D Pöllöjen Linna) avautuu!');
        setTimeout(function() { window.goToSlide(14); }, 850);
        return;
      }

      if (currentSlide === 14) {
        window.repair3DHall();
        return;
      }

      showToast('🛠️✨ KORJAUS VALMIS: Kaikki ammutut reiät ja diat on korjattu!');
    };

    window.shootOwlTower = function() {
      spawnOrbitalBeamFX(window.innerWidth / 2, window.innerHeight / 2, 480);
      var img = document.getElementById('towerOwlImg');
      if (img) img.style.transform = 'scale(2.4) rotate(12deg)';
      var fx = document.getElementById('orbital-fx-layer');
      if (fx) {
        var glass = document.createElement('div');
        glass.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:88;background:radial-gradient(circle,rgba(255,255,255,0.85) 0%,rgba(56,189,248,0.35) 35%,transparent 75%);';
        glass.innerHTML = '<svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="none"><g stroke="#ffffff" stroke-width="3" opacity="0.9"><line x1="500" y1="300" x2="80" y2="20"/><line x1="500" y1="300" x2="920" y2="40"/><line x1="500" y1="300" x2="960" y2="550"/><line x1="500" y1="300" x2="50" y2="560"/><polygon points="420,240 580,230 620,360 440,380" fill="none" stroke="#38bdf8" stroke-width="2.5"/></g></svg>';
        fx.appendChild(glass);
        setTimeout(function() { try { glass.remove(); } catch (e) {} }, 1150);
      }
      setTimeout(function() {
        if (img) img.style.transform = 'scale(1)';
        showDeathModal(
          '🦉🦶💥',
          'PÖLLÖ POTKAISI SINUT ULOS VERKKOSIVULTA! (4K)',
          'Ammuit Pöllöjen Tornia kesken korjaustöiden (”SIVUSTO KORJAUKSESSA”), joten raivostunut Pöllö särki ruutusi lasin ja potkaisi sinut ulos koko sivustolta!',
          '💡 Vinkki: Paina Sivulla 13 vihreää ”🛠️ KORJAUS” -nappia, niin korjaat tornin ja pääset Sivun 14 Fotorealistiseen 3D Pöllöjen Linnaan!'
        );
      }, 820);
    };

    function showDeathModal(icon, heading, reason, tip) {
      document.getElementById('deathIcon').textContent = icon;
      document.getElementById('deathHeading').textContent = heading;
      document.getElementById('deathReason').textContent = reason;
      document.getElementById('deathTip').textContent = tip;
      document.getElementById('deathModal').classList.add('show');
    }

    window.respawnPlayer = function(targetSlide) {
      document.getElementById('deathModal').classList.remove('show');
      window.goToSlide(targetSlide || 1);
    };

    window.open3DGameDirectly = function() {
      hasKnife = true;
      hasRailgun = true;
      hasStellar = true;
      unlocked[11] = true; unlocked[12] = true; unlocked[13] = true; unlocked[14] = true;
      buildDots();
      showToast('🏰 Tervetuloa Fotorealistiseen 3D Pöllöjen Linnaan! Kävele [WASD], lennä [Space] tai avaa Kartta [M]!');
      window.goToSlide(14);
    };

    // ============================================================================
    // SLIDE 14: MEGAREALISTIC 4K 3D OWL CASTLE
    // (Real 360° SwedishRoyalCastle CubeMap Skybox + Official Three.js PBR Textures
    //  + Official GLTF 3D Models + Real 4K Owl Photography Shrines)
    // ============================================================================
    var castleZones = [
      { id: 'throne', name: '1. Suuri Valtiosali (Grand Throne Hall)', layer: 1, x: 0, y: 0, z: 0, w: 30, d: 36, color: '#f59e0b',
        desc: 'Kuninkaallinen sali, 360° Royal Castle -ympäristöheijastukset, GLTF-patsaat ja Suurmestari Ylipöllön 4K-pyhäkkö.' },
      { id: 'armory', name: '2. Itäsiipi: O-Järjestön Asevarasto', layer: 1, x: 26, y: 0, z: 2, w: 22, d: 22, color: '#38bdf8',
        desc: 'Orbital Railgun MK-X -reaktorit, Komentajapöllön 4K-pyhäkkö ja Salaisuus #3: Kultainen Tonnikalareaktori.' },
      { id: 'command', name: '3. Länsisiipi: Komentokeskus & Holvi', layer: 1, x: -26, y: 0, z: 2, w: 22, d: 22, color: '#10b981',
        desc: 'O-järjestön 11 yhtiön komentosali ja Salaisuus #7: Timin Kultainen Kuuma Linja.' },
      { id: 'courtyard', name: '4. Eteläportti: Linnanpiha & Vallihauta', layer: 1, x: 0, y: 0, z: -32, w: 44, d: 28, color: '#60a5fa',
        desc: 'Kuninkaallinen linnanpiha 360° Swedish Royal Castle -taivaan alla, vallihaudan suojelija (#6) ja Boss-areena.' },
      { id: 'crypt', name: '5. Syvyyksien Laavakrypta (Kerros 2, -8m)', layer: 2, x: 0, y: -8, z: 18, w: 32, d: 26, color: '#ef4444',
        desc: 'Maanalainen PBR-laavaholvi (`lavatile.jpg`), Kryptan Varjopöllö ja Salaisuus #5: Kosminen Kruunumuna.' },
      { id: 'catacomb', name: '6. Muinaiset Riimukatakombit (Kerros 2, -8m)', layer: 2, x: -24, y: -8, z: 18, w: 18, d: 18, color: '#a855f7',
        desc: 'Salainen maanalainen holvikäytävä, joka yhdistää Länsisiiven ja Laavakryptan.' },
      { id: 'sky', name: '7. Kuninkaallinen Tähtitorni (Kerros 3, +14m)', layer: 3, x: 0, y: 14, z: 12, w: 26, d: 24, color: '#e879f9',
        desc: 'Korkealla linnan yllä leijuva tähtitasanne, Tähtipöllö ja Salaisuus #4: Kaukoputki.' },
      { id: 'floating', name: '8. Kelluvat Kuninkaan Saaret (Kerros 3, +14m)', layer: 3, x: 24, y: 14, z: -12, w: 20, d: 20, color: '#fde047',
        desc: 'Taivaalla leijuvat marmorisaaret, joille voi lentää Starlight-rakettirepulla [Space]!' }
    ];

    var game3D = {
      x: 0, y: 0, z: -12,
      vy: 0,
      yaw: 0, pitch: 0,
      hp: 100,
      jetFuel: 100,
      weapon: 1,
      flashlightOn: false,
      envIndex: 0,
      goldenBeam: false,
      choirTime: 0,
      mapLayer: 1,
      selectedZoneId: 'throne',
      discoveredZones: { throne: true, courtyard: true },
      customWaypoint: null,
      keys: { fwd: false, back: false, left: false, right: false, turnL: false, turnR: false, up: false, sprint: false },
      dragging: false,
      lastX: 0, lastY: 0,
      talked: {},
      gltfMixers: [],
      boss: { active: false, hp: 1000, maxHp: 1000, x: 0, y: 3.5, z: -30, angle: 0, mesh: null },
      secretsFound: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false },
      secrets: [
        { id: 1, name: "Pylvään Soihtuvipu", icon: "🕯️", x: -11, y: 0, z: 4, zone: "throne", color: "#10b981",
          desc: "Vedit soihtuvipua! Hissi ja salaportti Syvyyksien Laavakryptaan (-8m) on nyt auki!" },
        { id: 2, name: "Alttarin Kultainen Holvi", icon: "👑", x: 0, y: 0, z: 13.5, zone: "throne", color: "#fde047",
          desc: "Avasit Kultaisen Alttarin salaluukun! Löysit O-järjestön alkuperäisen kultaisen perustamissinetin!" },
        { id: 3, name: "Kultainen Tonnikalareaktori", icon: "🐟", x: 28, y: 0, z: 3, zone: "armory", color: "#38bdf8",
          desc: "Aktivoit Kultaisen Tonnikalareaktorin! Kaikki 3D-aseesi on päivitetty Hyper-4K Kultasäteiksi!" },
        { id: 4, name: "Tähtitornin Kaukoputki", icon: "🔭", x: 0, y: 14, z: 20, zone: "sky", color: "#e879f9",
          desc: "Suuntasit Tähtitornin 4K-kaukoputken syvään avaruuteen ja kutsuit kultaisen tähdenlentoparven!" },
        { id: 5, name: "Kosminen Kruunumuna", icon: "🥚", x: 0, y: -8, z: 24, zone: "crypt", color: "#f59e0b",
          desc: "Nostit Kosmisen Kruunumunan Laavakryptan tulialttarilta! Suojakilpesi on nyt 200 % vahvempi!" },
        { id: 6, name: "Vallihaudan Suojelija", icon: "🐉", x: 14, y: 0, z: -20, zone: "courtyard", color: "#60a5fa",
          desc: "Aktivoit vallihaudan 4K-suojelijan! Se vartioi nyt linnan eteläporttia!" },
        { id: 7, name: "Timin Kultainen Kuuma Linja", icon: "📞", x: -28, y: 0, z: 3, zone: "command", color: "#34d399",
          desc: "Soitit Komentokeskuksen kultaisesta satelliittipuhelimesta Timin numeroon (+358 44 9854292)!" }
      ],
      crystals: [
        { x: -8, y: 0, z: -6, broken: false, mesh: null },
        { x: 8, y: 0, z: -6, broken: false, mesh: null },
        { x: -8, y: 0, z: 6, broken: false, mesh: null },
        { x: 8, y: 0, z: 6, broken: false, mesh: null },
        { x: 22, y: 0, z: -3, broken: false, mesh: null },
        { x: 22, y: 0, z: 7, broken: false, mesh: null },
        { x: -22, y: 0, z: -3, broken: false, mesh: null },
        { x: -22, y: 0, z: 7, broken: false, mesh: null },
        { x: -7, y: -8, z: 16, broken: false, mesh: null },
        { x: 7, y: -8, z: 16, broken: false, mesh: null },
        { x: -6, y: 14, z: 10, broken: false, mesh: null },
        { x: 6, y: 14, z: 10, broken: false, mesh: null }
      ],
      owls: [
        { id: 1, name: "Suurmestari Ylipöllö", role: "Valtakunnan Hallitsija • Suuri Valtiosali (0m)", x: 0, y: 0, z: 10.5, color: "#f59e0b",
          photo: "https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?auto=format&fit=crop&w=900&q=85", mesh: null,
          text: "HUU-HUU! Tervetuloa Fotorealistiseen 4K Pöllöjen Valtakuntaan! Paina [Space] lentääksesi Starlight-rakettirepulla ylös Tähtitorniin (+14m), laskeudu Laavakryptaan (-8m) tai avaa Valtakunnan Arkkitehtuurikartta [M]!",
          opts: [{ label: "👑 Kruunaa minut Valtakunnan Suurmestariksi", act: "crown" }, { label: "🗺️ Avaa 3-kerroksinen Valtakunnan Kartta [M]", act: "map" }, { label: "🔍 Avaa Alttarin Kultainen Holvi (#2)", act: "sec2" }] },
        { id: 2, name: "Arkkitehtipöllö", role: "Kerroshissien & Salakäytävien Mestari (0m)", x: -7.5, y: 0, z: 2, color: "#10b981",
          photo: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=900&q=85", mesh: null,
          text: "Suunnittelin tähän linnaan 3 kerrosta, 360° Kuninkaallisen Linnan ympäristökartan ja 8 aluetta! Kartalta [M] voit vaihtaa kerrosta tai teleportata suoraan Laavakryptaan ja Tähtitorniin!",
          opts: [{ label: "🕯️ Vedä Pylvään Soihtuvipua (#1 ▶ Laavakrypta)", act: "sec1" }, { label: "🛠️ Korjaa koko 3D-Valtakunta", act: "repair" }] },
        { id: 3, name: "Komentajapöllö", role: "Itäsiiven Orbital-Asevarasto (0m)", x: 24, y: 0, z: 3, color: "#38bdf8",
          photo: "https://images.unsplash.com/photo-1516233758813-a38d024919c5?auto=format&fit=crop&w=900&q=85", mesh: null,
          text: "Tervetuloa Itäsiiven Asevarastoon! Kokeile kaikkia 4 asetta alareunan napeista: [1] Orbital Railgun, [2] Gravitia SS6, [3] Tornado-Kanuuna ja [4] Kvanttikorjain!",
          opts: [{ label: "🐟 Aktivoi Kultainen Tonnikalareaktori (#3)", act: "sec3" }, { label: "🌪️ Valitse Tornado-Kanuuna [3]", act: "wep3" }] },
        { id: 4, name: "Tähtipöllö", role: "Kerros 3: Kuninkaallinen Tähtitorni (+14m)", x: 0, y: 14, z: 16, color: "#e879f9",
          photo: "https://images.unsplash.com/photo-1553264701-d138db4fd5d4?auto=format&fit=crop&w=900&q=85", mesh: null,
          text: "Olet noussut +14 metrin korkeuteen Kuninkaalliseen Tähtitorniin! Täältä näet 360° linnan panoraaman, kelluvat saaret ja voit tähyillä kaukoputkella (#4)!",
          opts: [{ label: "🔭 Käytä Tähtitornin Kaukoputkea (#4)", act: "sec4" }, { label: "🕳️ Valitse Gravitia SS6 [2]", act: "wep2" }] },
        { id: 5, name: "Kryptan Varjopöllö", role: "Kerros 2: Syvyyksien Laavakrypta (-8m)", x: 0, y: -8, z: 20, color: "#ef4444",
          photo: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=85", mesh: null,
          text: "HUU! Laskeuduit -8 metrin syvyyteen tulikuumaan Laavakryptaan! Täällä säilytämme muinaista Kosmista Kruunumunaa (#5)!",
          opts: [{ label: "🥚 Ota Kosminen Kruunumuna (#5)", act: "sec5" }, { label: "🎶 Käynnistä Pöllökuoron 3D-rituaali", act: "choir" }] },
        { id: 6, name: "Amiraalipöllö", role: "Eteläportin Linnanpiha & Vallihauta (0m)", x: 0, y: 0, z: -24, color: "#60a5fa",
          photo: "https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?auto=format&fit=crop&w=900&q=85", mesh: null,
          text: "Seisot Eteläportin Linnanpihalla! Voit aktivoida vallihaudan suojelijan (#6) tai haastaa Kyber-Ylipöllö Bossin kaksintaisteluun!",
          opts: [{ label: "🐉 Aktivoi Vallihaudan Suojelija (#6)", act: "sec6" }, { label: "⚔️ Kutsu Kyber-Ylipöllö Bossi!", act: "boss" }] }
      ],
      activeEffects: []
    };

    var threeCtx = {
      ready: false,
      scene: null,
      camera: null,
      renderer: null,
      royalCubeMap: null,
      ambientLight: null,
      sunLight: null,
      altarLight: null,
      flashlight: null,
      flashlightTarget: null,
      dustSystem: null,
      waypointBeacon: null,
      clock: null,
      jumpPads: [
        { x: 0, y: 0, z: 6, targetY: 14, color: 0xe879f9, label: "Taivashissi (+14m)" },
        { x: -10, y: 0, z: 6, targetY: -8, color: 0xef4444, label: "Kryptahissi (-8m)" },
        { x: 0, y: -8, z: 12, targetY: 0, color: 0x10b981, label: "Paluuhissi (0m)" }
      ],
      secretMeshes: {}
    };

    // Build an Ornate 4K Photographic Reliquary Shrine (Zero Primitive Sculpting!)
    function buildPhotorealOwlShrine(owlData, texLoader) {
      var group = new THREE.Group();
      var colHex = parseInt(owlData.color.replace('#', '0x'), 16);

      var base1 = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.8, 0.55, 32),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.15 })
      );
      base1.position.y = 0.275;
      group.add(base1);

      var frameOuter = new THREE.Mesh(
        new THREE.BoxGeometry(2.35, 2.95, 0.16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.92, roughness: 0.14 })
      );
      frameOuter.position.y = 2.05;
      group.add(frameOuter);

      var fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 512; fallbackCanvas.height = 640;
      var fg = fallbackCanvas.getContext('2d');
      fg.fillStyle = '#0f172a';
      fg.fillRect(0, 0, 512, 640);
      fg.strokeStyle = '#fde047';
      fg.lineWidth = 10;
      fg.strokeRect(16, 16, 480, 608);
      var fallbackTex = new THREE.CanvasTexture(fallbackCanvas);

      var portraitMat = new THREE.MeshBasicMaterial({ map: fallbackTex, side: THREE.DoubleSide });
      texLoader.load(owlData.photo, function(loadedTex) {
        portraitMat.map = loadedTex;
        portraitMat.needsUpdate = true;
      });

      var portraitFront = new THREE.Mesh(new THREE.PlaneGeometry(2.14, 2.74), portraitMat);
      portraitFront.position.set(0, 2.05, 0.09);
      group.add(portraitFront);

      var portraitBack = new THREE.Mesh(new THREE.PlaneGeometry(2.14, 2.74), portraitMat);
      portraitBack.rotation.y = Math.PI;
      portraitBack.position.set(0, 2.05, -0.09);
      group.add(portraitBack);

      // Crisp Floating 3D Nameplate Banner
      var lc = document.createElement('canvas');
      lc.width = 512; lc.height = 128;
      var lg = lc.getContext('2d');
      lg.fillStyle = 'rgba(3, 7, 18, 0.92)';
      lg.strokeStyle = owlData.color;
      lg.lineWidth = 6;
      lg.strokeRect(8, 8, 496, 112);
      lg.fillRect(8, 8, 496, 112);
      lg.fillStyle = '#fde047';
      lg.font = '900 28px Inter, sans-serif';
      lg.textAlign = 'center';
      lg.fillText(owlData.name, 256, 56);
      lg.fillStyle = '#bae6fd';
      lg.font = '700 20px Inter, sans-serif';
      lg.fillText('[E] tai Tuplaklikkaa keskustellaksesi', 256, 94);

      var labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(lc), transparent: true }));
      labelSprite.position.set(0, 4.1, 0);
      labelSprite.scale.set(3.4, 0.85, 1);
      group.add(labelSprite);

      group.position.set(owlData.x, owlData.y, owlData.z);
      group.userData = { type: 'owl', owl: owlData, frame: frameOuter };
      return group;
    }

    function initThreeCastleWorld() {
      if (threeCtx.ready) return;
      var container = document.getElementById('threeViewport');
      if (!container || typeof THREE === 'undefined') return;
      threeCtx.ready = true;
      threeCtx.clock = new THREE.Clock();

      var w = container.clientWidth || 1100;
      var h = container.clientHeight || 560;

      var scene = new THREE.Scene();
      threeCtx.scene = scene;

      var camera = new THREE.PerspectiveCamera(62, w / h, 0.1, 450);
      camera.position.set(game3D.x, game3D.y + 2.35, game3D.z);
      threeCtx.camera = camera;

      var renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      threeCtx.renderer = renderer;

      var texLoader = new THREE.TextureLoader();
      texLoader.setCrossOrigin('anonymous');

      // 1. REAL 360° SWEDISH ROYAL CASTLE CUBEMAP SKYBOX & PBR REFLECTION ENVIRONMENT
      var cubeLoader = new THREE.CubeTextureLoader();
      cubeLoader.setCrossOrigin('anonymous');
      cubeLoader.setPath('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/SwedishRoyalCastle/');
      var royalCube = cubeLoader.load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
      scene.background = royalCube;
      scene.environment = royalCube;
      threeCtx.royalCubeMap = royalCube;

      // 2. REALISTIC LIGHTING
      var ambient = new THREE.HemisphereLight(0xffffff, 0x334155, 1.05);
      scene.add(ambient);
      threeCtx.ambientLight = ambient;

      var sun = new THREE.DirectionalLight(0xfef08a, 1.45);
      sun.position.set(30, 55, -25);
      scene.add(sun);
      threeCtx.sunLight = sun;

      var altarLight = new THREE.PointLight(0xf59e0b, 2.5, 50);
      altarLight.position.set(0, 7, 10);
      scene.add(altarLight);
      threeCtx.altarLight = altarLight;

      var flash = new THREE.SpotLight(0xe0f2fe, 0, 60, Math.PI / 5, 0.35, 1.2);
      var flashTarget = new THREE.Object3D();
      scene.add(flash);
      scene.add(flashTarget);
      flash.target = flashTarget;
      threeCtx.flashlight = flash;
      threeCtx.flashlightTarget = flashTarget;

      // 3. OFFICIAL THREE.JS PBR TEXTURES (HARDWOOD, BRICK & LAVA)
      var texBase = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/';
      var woodDiff = texLoader.load(texBase + 'hardwood2_diffuse.jpg');
      var woodBump = texLoader.load(texBase + 'hardwood2_bump.jpg');
      var woodRough = texLoader.load(texBase + 'hardwood2_roughness.jpg');
      [woodDiff, woodBump, woodRough].forEach(function(t) {
        t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping; t.repeat.set(16, 16);
      });

      var brickDiff = texLoader.load(texBase + 'brick_diffuse.jpg');
      var brickBump = texLoader.load(texBase + 'brick_bump.jpg');
      [brickDiff, brickBump].forEach(function(t) {
        t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 3);
      });

      var lavaTex = texLoader.load(texBase + 'lava/lavatile.jpg');
      lavaTex.wrapS = THREE.RepeatWrapping; lavaTex.wrapT = THREE.RepeatWrapping; lavaTex.repeat.set(8, 8);

      // Main Castle Floor with Real PBR Hardwood & Royal Carpet
      var mainFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(92, 92),
        new THREE.MeshStandardMaterial({
          map: woodDiff, bumpMap: woodBump, bumpScale: 0.08, roughnessMap: woodRough,
          roughness: 0.35, metalness: 0.25
        })
      );
      mainFloor.rotation.x = -Math.PI / 2;
      scene.add(mainFloor);

      var carpet = new THREE.Mesh(
        new THREE.PlaneGeometry(5.6, 46),
        new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.55, metalness: 0.15 })
      );
      carpet.rotation.x = -Math.PI / 2;
      carpet.position.set(0, 0.02, -4);
      scene.add(carpet);

      // PBR Brick Castle Walls & Fluted Marble Columns
      var wallMat = new THREE.MeshStandardMaterial({ map: brickDiff, bumpMap: brickBump, bumpScale: 0.15, roughness: 0.65 });
      var northWall = new THREE.Mesh(new THREE.BoxGeometry(44, 14, 1.2), wallMat);
      northWall.position.set(0, 7, 22);
      scene.add(northWall);

      var pillarGeo = new THREE.CylinderGeometry(0.85, 1.0, 13.5, 32);
      var pillarMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.75 });
      [-11, 11].forEach(function(px) {
        [-12, -4, 4, 12].forEach(function(pz) {
          var pil = new THREE.Mesh(pillarGeo, pillarMat);
          pil.position.set(px, 6.75, pz);
          scene.add(pil);

          var cap = new THREE.Mesh(
            new THREE.CylinderGeometry(1.22, 0.9, 0.6, 32),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.12 })
          );
          cap.position.set(px, 13.2, pz);
          scene.add(cap);
        });
      });

      // Royal Altar Pedestal (Clean, No Ugly Rings!)
      var altarBase = new THREE.Mesh(
        new THREE.CylinderGeometry(3.0, 3.6, 0.85, 48),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.12 })
      );
      altarBase.position.set(0, 0.425, 10.5);
      scene.add(altarBase);

      // Water Moat in Southern Courtyard reflecting the 360° Royal Castle Skybox
      var moat = new THREE.Mesh(
        new THREE.PlaneGeometry(54, 14),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.04, metalness: 0.95 })
      );
      moat.rotation.x = -Math.PI / 2;
      moat.position.set(0, 0.03, -22);
      scene.add(moat);

      // Level 2 (Y: -8m) — Deep Lava Crypt with Official Lava Texture
      var cryptFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(42, 36),
        new THREE.MeshStandardMaterial({ map: lavaTex, emissive: 0xdc2626, emissiveMap: lavaTex, emissiveIntensity: 0.75, roughness: 0.4 })
      );
      cryptFloor.rotation.x = -Math.PI / 2;
      cryptFloor.position.set(0, -8, 18);
      scene.add(cryptFloor);

      // Level 3 (Y: +14m) — Royal Sky Observatory & Floating Island
      var skyPlatform = new THREE.Mesh(
        new THREE.CylinderGeometry(14, 11, 0.8, 48),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.12, metalness: 0.85 })
      );
      skyPlatform.position.set(0, 13.6, 12);
      scene.add(skyPlatform);

      var floatIsland = new THREE.Mesh(
        new THREE.CylinderGeometry(9, 5, 1.4, 32),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.18 })
      );
      floatIsland.position.set(24, 13.3, -12);
      scene.add(floatIsland);

      // Jump Pads between the 3 Floors
      threeCtx.jumpPads.forEach(function(jp) {
        var pad = new THREE.Mesh(
          new THREE.CylinderGeometry(1.6, 1.8, 0.25, 32),
          new THREE.MeshBasicMaterial({ color: jp.color })
        );
        pad.position.set(jp.x, jp.y + 0.12, jp.z);
        scene.add(pad);
      });

      // 6 Ornate 4K Photographic Owl Reliquaries
      game3D.owls.forEach(function(o) {
        var shrine = buildPhotorealOwlShrine(o, texLoader);
        o.mesh = shrine;
        scene.add(shrine);
      });

      // Load Real Official Three.js GLTF 3D Models (DamagedHelmet, Horse, Parrot, Stork, Flamingo)
      if (typeof THREE.GLTFLoader !== 'undefined') {
        try {
          var gltfLoader = new THREE.GLTFLoader();
          // 1) Official Sci-Fi PBR DamagedHelmet on the Royal Altar & Boss Core
          gltfLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf', function(gltf) {
            var helmet = gltf.scene;
            helmet.scale.set(1.35, 1.35, 1.35);
            helmet.position.set(0, 2.2, 13.5);
            scene.add(helmet);

            // Also use a giant Golden/Red PBR DamagedHelmet for the Cyber-Owl Boss!
            var bossHelmet = helmet.clone();
            bossHelmet.scale.set(3.2, 3.2, 3.2);
            bossHelmet.position.set(0, 0, 0);
            if (game3D.boss.mesh) {
              game3D.boss.mesh.clear();
              game3D.boss.mesh.add(bossHelmet);
            }
          }, undefined, function() {});

          // 2) Royal Bronze Horse Statues flanking the Grand Throne Hall
          gltfLoader.load('https://threejs.org/examples/models/gltf/Horse.glb', function(gltf) {
            var h1 = gltf.scene;
            h1.scale.set(0.018, 0.018, 0.018);
            h1.position.set(-5.5, 0, -14);
            scene.add(h1);
            var h2 = h1.clone();
            h2.position.set(5.5, 0, -14);
            scene.add(h2);
          }, undefined, function() {});

          // 3) Soaring Animated 3D Birds (Parrot, Stork, Flamingo)
          ['https://threejs.org/examples/models/gltf/Stork.glb', 'https://threejs.org/examples/models/gltf/Parrot.glb', 'https://threejs.org/examples/models/gltf/Flamingo.glb'].forEach(function(url, idx) {
            gltfLoader.load(url, function(gltf) {
              var bird = gltf.scene;
              bird.scale.set(0.035, 0.035, 0.035);
              bird.position.set((idx - 1) * 6, 8.5 + idx * 1.2, 4);
              scene.add(bird);
              if (gltf.animations && gltf.animations.length > 0) {
                var mixer = new THREE.AnimationMixer(bird);
                mixer.clipAction(gltf.animations[0]).play();
                game3D.gltfMixers.push({ mixer: mixer, mesh: bird, phase: idx * 2.1 });
              }
            }, undefined, function() {});
          });
        } catch (err) {}
      }

      // 7 Interactive Secrets in the 3D World
      game3D.secrets.forEach(function(sec) {
        var secCol = parseInt(sec.color.replace('#', '0x'), 16);
        var sGroup = new THREE.Group();
        var ped = new THREE.Mesh(
          new THREE.CylinderGeometry(0.65, 0.85, 0.9, 24),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.12 })
        );
        ped.position.y = 0.45;
        sGroup.add(ped);

        var orb = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.6, 2),
          new THREE.MeshStandardMaterial({ color: secCol, emissive: secCol, emissiveIntensity: 0.65, metalness: 0.95, roughness: 0.05 })
        );
        orb.position.y = 1.6;
        sGroup.add(orb);

        sGroup.position.set(sec.x, sec.y, sec.z);
        sGroup.userData = { type: 'secret', secret: sec, orb: orb };
        scene.add(sGroup);
        threeCtx.secretMeshes[sec.id] = sGroup;
      });

      // 12 Reflective Metallic-Glass Energy Crystals
      game3D.crystals.forEach(function(cr, idx) {
        var cMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.95, 0),
          new THREE.MeshStandardMaterial({
            color: idx % 2 === 0 ? 0x38bdf8 : 0xfde047,
            metalness: 0.96,
            roughness: 0.06
          })
        );
        cMesh.position.set(cr.x, cr.y + 1.5, cr.z);
        cMesh.userData = { type: 'crystal', crystal: cr };
        cr.mesh = cMesh;
        scene.add(cMesh);
      });

      // Boss Group Container (strictly hidden until summoned)
      var bossGroup = new THREE.Group();
      var fallbackBoss = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.2, 2),
        new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.95, roughness: 0.1 })
      );
      bossGroup.add(fallbackBoss);
      bossGroup.position.set(game3D.boss.x, game3D.boss.y, game3D.boss.z);
      bossGroup.visible = false;
      scene.add(bossGroup);
      game3D.boss.mesh = bossGroup;

      // Mouse Look & Click Interaction inside 3D Viewport
      var dom = renderer.domElement;
      dom.addEventListener('mousedown', function(e) {
        if (e.button === 0) {
          game3D.dragging = true;
          game3D.lastX = e.clientX;
          game3D.lastY = e.clientY;
        }
      });
      window.addEventListener('mouseup', function() { game3D.dragging = false; });
      window.addEventListener('mousemove', function(e) {
        if (!game3D.dragging || currentSlide !== 14) return;
        var dx = e.clientX - game3D.lastX;
        var dy = e.clientY - game3D.lastY;
        game3D.lastX = e.clientX;
        game3D.lastY = e.clientY;
        game3D.yaw -= dx * 0.0045;
        game3D.pitch = Math.max(-0.68, Math.min(0.68, game3D.pitch - dy * 0.0035));
      });
      dom.addEventListener('dblclick', function() {
        window.interact3DCastle();
      });
    }

    function resize3DCanvas() {
      initThreeCastleWorld();
      var container = document.getElementById('threeViewport');
      if (!container || !threeCtx.renderer || !threeCtx.camera) return;
      var w = container.clientWidth || 1100;
      var h = container.clientHeight || 560;
      threeCtx.camera.aspect = w / h;
      threeCtx.camera.updateProjectionMatrix();
      threeCtx.renderer.setSize(w, h);
    }
    window.addEventListener('resize', resize3DCanvas);

    // Cycle 360° CubeMap & Lighting Exposure Presets
    var envPresets = [
      { label: '🏰 Skybox: Royal Castle', exp: 1.25, sunCol: 0xfef08a },
      { label: '🌅 Kultainen Iltapäivä', exp: 1.55, sunCol: 0xf97316 },
      { label: '🌌 Kuninkaallinen Yö', exp: 0.72, sunCol: 0x38bdf8 }
    ];
    window.cycleUE5Environment = function() {
      initThreeCastleWorld();
      game3D.envIndex = (game3D.envIndex + 1) % envPresets.length;
      var p = envPresets[game3D.envIndex];
      if (threeCtx.renderer) threeCtx.renderer.toneMappingExposure = p.exp;
      if (threeCtx.sunLight) threeCtx.sunLight.color.setHex(p.sunCol);
      document.getElementById('envCycleBtn').textContent = p.label;
      showToast(p.label + ' aktivoitu!');
    };

    window.toggleFlashlight = function() {
      game3D.flashlightOn = !game3D.flashlightOn;
      if (threeCtx.flashlight) threeCtx.flashlight.intensity = game3D.flashlightOn ? 3.5 : 0;
      document.getElementById('flashlightBtn').className = game3D.flashlightOn ? 'pill-btn gold' : 'pill-btn';
      showToast(game3D.flashlightOn ? '🔦 Taktinen valonheitin PÄÄLLÄ' : '🔦 Valonheitin POIS');
    };

    window.hold3D = function(dir, state) {
      if (game3D.keys.hasOwnProperty(dir)) game3D.keys[dir] = state;
    };

    window.set3DWeapon = function(w) {
      game3D.weapon = w;
      for (var i = 1; i <= 5; i++) {
        var b = document.getElementById('wepBtn' + i);
        if (b) {
          if (i === 5) b.className = (i === w) ? 'pill-btn gold' : 'pill-btn omega';
          else b.className = (i === w) ? 'pill-btn gold' : 'pill-btn';
        }
      }
      var names = {
        1: '🛰️ Orbital Railgun MK-X',
        2: '🕳️ Gravitia SS6 (Musta aukko)',
        3: '🌪️ Tornado-Kanuuna',
        4: '🛠️ Kvanttikorjain',
        5: '☢️ TUOMION OMEGA-ASE (VAROITUS!)'
      };
      showToast('Valittu ase: ' + (names[w] || ''));
      if (w === 5) {
        window.openOmegaWarningModal();
      }
    };

    window.teleportCastleZone = function(zoneId) {
      var z = null;
      for (var i = 0; i < castleZones.length; i++) {
        if (castleZones[i].id === zoneId) { z = castleZones[i]; break; }
      }
      if (!z) return;
      game3D.x = z.x;
      game3D.y = z.y;
      game3D.z = z.z - 4;
      game3D.vy = 0;
      game3D.discoveredZones[z.id] = true;
      playSound(280, 920, 0.3, 'sine');
      showToast('⚡ Siirryttiin alueelle: ' + z.name);
      toggleCastleMapModal(false);
    };

    window.activateSecretById = function(id) {
      var sec = null;
      for (var i = 0; i < game3D.secrets.length; i++) {
        if (game3D.secrets[i].id === id) { sec = game3D.secrets[i]; break; }
      }
      if (!sec) return;
      game3D.secretsFound[id] = true;
      if (id === 3) game3D.goldenBeam = true;
      if (id === 5) game3D.hp = 200;

      var row = document.getElementById('secRow' + id);
      if (row) {
        row.style.background = 'rgba(16, 185, 129, 0.25)';
        row.style.border = '1px solid #10b981';
        row.innerHTML = '✅ <strong>' + id + '. ' + sec.name + ':</strong> LÖYDETTY!';
      }

      var count = 0;
      for (var k = 1; k <= 7; k++) { if (game3D.secretsFound[k]) count++; }
      var sc = document.getElementById('secretCounterHud');
      if (sc) sc.textContent = count + '/7';

      playSound(360, 1240, 0.45, 'triangle');
      showToast('🔍 SALAISUUS #' + id + ' LÖYDETTY: ' + sec.desc);
      drawKingdomBlueprintMap();
    };

    window.shoot3D = function() {
      initThreeCastleWorld();
      if (!threeCtx.scene) return;

      if (game3D.weapon === 4) {
        window.repair3DHall();
        return;
      }
      if (game3D.weapon === 5) {
        window.openOmegaWarningModal();
        return;
      }

      var sin = Math.sin(game3D.yaw);
      var cos = Math.cos(game3D.yaw);
      var tx = game3D.x - sin * 14;
      var tz = game3D.z - cos * 14;
      var ty = game3D.y;

      var col = game3D.goldenBeam ? 0xfde047 : (game3D.weapon === 1 ? 0x38bdf8 : (game3D.weapon === 2 ? 0xa855f7 : 0x10b981));
      playSound(240, 32, 0.55, 'sawtooth');

      var beamMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 32, 16),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 })
      );
      beamMesh.position.set(tx, ty + 14, tz);
      threeCtx.scene.add(beamMesh);

      var ringMesh = new THREE.Mesh(
        new THREE.TorusGeometry(1.2, 0.16, 12, 36),
        new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.95 })
      );
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(tx, ty + 0.3, tz);
      threeCtx.scene.add(ringMesh);

      game3D.activeEffects.push({ beam: beamMesh, ring: ringMesh, t: 0 });

      game3D.crystals.forEach(function(cr) {
        if (!cr.broken && Math.hypot(cr.x - tx, cr.z - tz) < 6.5 && Math.abs(cr.y - ty) < 5) {
          cr.broken = true;
          if (cr.mesh) cr.mesh.visible = false;
        }
      });

      if (game3D.boss.active && Math.hypot(game3D.boss.x - tx, game3D.boss.z - tz) < 9) {
        var dmg = game3D.goldenBeam ? 250 : 140;
        game3D.boss.hp = Math.max(0, game3D.boss.hp - dmg);
        updateBossHud();
        if (game3D.boss.hp <= 0) {
          game3D.boss.active = false;
          if (game3D.boss.mesh) game3D.boss.mesh.visible = false;
          document.getElementById('bossHudWrap').style.display = 'none';
          document.getElementById('bossToggleBtn').textContent = '⚔️ BOSSI';
          showToast('🏆 KUKISTIT KYBER-YLIPÖLLÖ BOSSIN! Valtakunta on pelastettu!');
        }
      }
    };

    window.repair3DHall = function() {
      playSound(320, 1180, 0.45, 'sine');
      game3D.crystals.forEach(function(cr) {
        cr.broken = false;
        if (cr.mesh) cr.mesh.visible = true;
      });
      game3D.hp = Math.max(100, game3D.hp);
      document.getElementById('hudHpText').textContent = game3D.hp + '%';
      showToast('🛠️✨ Koko 3D-Linna ja kaikki 12 energiakristallia on korjattu!');
    };

    window.toggleCyberOwlBoss = function() {
      initThreeCastleWorld();
      game3D.boss.active = !game3D.boss.active;
      var wrap = document.getElementById('bossHudWrap');
      var btn = document.getElementById('bossToggleBtn');
      if (game3D.boss.active) {
        game3D.boss.hp = game3D.boss.maxHp;
        if (game3D.boss.mesh) game3D.boss.mesh.visible = true;
        wrap.style.display = 'block';
        btn.textContent = '🏳️ Lopeta Bossi';
        teleportCastleZone('courtyard');
        updateBossHud();
        showToast('⚔️ KYBER-YLIPÖLLÖ BOSSI SAAPUI LINNANPIHALLE! Ammu [F] kukistaaksesi sen!');
      } else {
        if (game3D.boss.mesh) game3D.boss.mesh.visible = false;
        wrap.style.display = 'none';
        btn.textContent = '⚔️ BOSSI';
      }
    };

    function updateBossHud() {
      var pct = Math.max(0, Math.round((game3D.boss.hp / game3D.boss.maxHp) * 100));
      document.getElementById('bossHpLabel').textContent = game3D.boss.hp + ' / ' + game3D.boss.maxHp + ' HP';
      document.getElementById('bossHpBar').style.width = pct + '%';
    }

    window.interact3DCastle = function() {
      var bestOwl = null, bestDist = 9.5;
      game3D.owls.forEach(function(o) {
        var d = Math.hypot(o.x - game3D.x, o.z - game3D.z);
        if (d < bestDist && Math.abs(o.y - game3D.y) < 5) {
          bestDist = d; bestOwl = o;
        }
      });

      var bestSec = null, secDist = 6.5;
      game3D.secrets.forEach(function(s) {
        var d = Math.hypot(s.x - game3D.x, s.z - game3D.z);
        if (d < secDist && Math.abs(s.y - game3D.y) < 5) {
          secDist = d; bestSec = s;
        }
      });

      if (bestSec && (!bestOwl || secDist < bestDist)) {
        window.activateSecretById(bestSec.id);
        return;
      }
      if (bestOwl) {
        openRpgModal(bestOwl);
      } else {
        showToast('💬 Kävele lähemmäs 4K-pöllöpyhäkköä tai salaisuutta ja paina [E]!');
      }
    };

    function openRpgModal(owl) {
      game3D.talked[owl.id] = true;
      document.getElementById('dlgPortrait').src = owl.photo;
      document.getElementById('dlgRole').textContent = owl.role;
      document.getElementById('dlgName').textContent = owl.name;
      document.getElementById('dlgBody').textContent = owl.text;
      var box = document.getElementById('dlgOptions');
      box.innerHTML = '';
      (owl.opts || []).forEach(function(opt) {
        var b = document.createElement('button');
        b.className = 'pill-btn gold';
        b.textContent = opt.label;
        b.onclick = function() {
          if (opt.act === 'map') { closeRpgModal(); toggleCastleMapModal(true); }
          else if (opt.act === 'repair') { closeRpgModal(); repair3DHall(); }
          else if (opt.act === 'boss') { closeRpgModal(); toggleCyberOwlBoss(); }
          else if (opt.act === 'choir') { closeRpgModal(); game3D.choirTime = 8; showToast('🎶 Pöllökuoron 3D-rituaali käynnistyi!'); }
          else if (opt.act === 'crown') { closeRpgModal(); game3D.goldenBeam = true; showToast('👑 Sinut on kruunattu Pöllöjen Valtakunnan Suurmestariksi!'); }
          else if (opt.act.indexOf('sec') === 0) { closeRpgModal(); activateSecretById(parseInt(opt.act.replace('sec', ''), 10)); }
          else if (opt.act.indexOf('wep') === 0) { closeRpgModal(); set3DWeapon(parseInt(opt.act.replace('wep', ''), 10)); }
        };
        box.appendChild(b);
      });
      document.getElementById('rpgModal').style.display = 'block';
    }

    window.closeRpgModal = function() {
      document.getElementById('rpgModal').style.display = 'none';
    };

    // =========================================================================
    // 3D CASTLE MAP MODAL, COMPASS, KEYBOARD CONTROLS & RENDER LOOP
    // =========================================================================
    window.toggleCastleMapModal = function(show) {
      var m = document.getElementById('castleMapModal');
      if (!m) return;
      var nextState = (typeof show === 'boolean') ? show : (m.style.display === 'none' || !m.style.display);
      m.style.display = nextState ? 'flex' : 'none';
      if (nextState) drawKingdomBlueprintMap();
    };

    window.switchMapLayer = function(layerNum) {
      game3D.mapLayer = layerNum;
      [1, 2, 3].forEach(function(n) {
        var b = document.getElementById('mapLayerBtn' + n);
        if (b) b.className = (n === layerNum) ? 'pill-btn gold' : 'pill-btn';
      });
      drawKingdomBlueprintMap();
    };

    window.revealAllMapFog = function() {
      castleZones.forEach(function(z) { game3D.discoveredZones[z.id] = true; });
      drawKingdomBlueprintMap();
      showToast('🛰️ Kaikki 8 linnan sektoria ja 3 kerrosta paljastettu kartalla!');
    };

    window.clearCustomWaypoint = function() {
      game3D.customWaypoint = null;
      if (threeCtx.waypointBeacon && threeCtx.scene) {
        threeCtx.scene.remove(threeCtx.waypointBeacon);
        threeCtx.waypointBeacon = null;
      }
      drawKingdomBlueprintMap();
      showToast('🗑️ 3D-reittipiste poistettu.');
    };

    window.teleportToSelectedMapZone = function() {
      window.teleportCastleZone(game3D.selectedZoneId || 'throne');
    };

    window.pinSelectedMapZone = function() {
      var z = null;
      for (var i = 0; i < castleZones.length; i++) {
        if (castleZones[i].id === game3D.selectedZoneId) { z = castleZones[i]; break; }
      }
      if (!z) return;
      setCustom3DWaypoint(z.x, z.y, z.z, z.name);
    };

    function setCustom3DWaypoint(wx, wy, wz, label) {
      game3D.customWaypoint = { x: wx, y: wy, z: wz, label: label || '3D-Majakka' };
      initThreeCastleWorld();
      if (threeCtx.scene) {
        if (threeCtx.waypointBeacon) threeCtx.scene.remove(threeCtx.waypointBeacon);
        var beacon = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 40, 16),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
        );
        beacon.position.set(wx, wy + 20, wz);
        threeCtx.scene.add(beacon);
        threeCtx.waypointBeacon = beacon;
      }
      drawKingdomBlueprintMap();
      showToast('📍 3D-Valopilari asetettu kohteeseen: ' + (label || 'Karttapiste'));
    }

    function drawKingdomBlueprintMap() {
      var c = document.getElementById('kingdomBlueprintCanvas');
      if (!c) return;
      var ctx = c.getContext('2d');
      var W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#04091a';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.lineWidth = 1;
      for (var gx = 0; gx < W; gx += 35) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (var gy = 0; gy < H; gy += 35) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      var cx = W / 2, cy = H / 2 + 10, scale = 5.2;

      castleZones.forEach(function(z) {
        if (z.layer !== game3D.mapLayer) return;
        var rx = cx + (z.x - z.w / 2) * scale;
        var ry = cy - (z.z + z.d / 2) * scale;
        var rw = z.w * scale;
        var rh = z.d * scale;
        var isSel = z.id === game3D.selectedZoneId;

        ctx.fillStyle = isSel ? 'rgba(245, 158, 11, 0.28)' : 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = isSel ? '#fde047' : z.color;
        ctx.lineWidth = isSel ? 3 : 2;
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(z.name, rx + rw / 2, ry + rh / 2);
      });

      game3D.secrets.forEach(function(s) {
        var sx = cx + s.x * scale;
        var sy = cy - s.z * scale;
        ctx.fillStyle = game3D.secretsFound[s.id] ? '#10b981' : '#fde047';
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#020617';
        ctx.font = '900 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(s.id), sx, sy + 3);
      });

      if (game3D.customWaypoint) {
        var wx = cx + game3D.customWaypoint.x * scale;
        var wy = cy - game3D.customWaypoint.z * scale;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(wx, wy, 9, 0, Math.PI * 2);
        ctx.stroke();
      }

      var px = cx + game3D.x * scale;
      var py = cy - game3D.z * scale;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-game3D.yaw);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(6, 7);
      ctx.lineTo(-6, 7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawCompassStrip() {
      var c = document.getElementById('compassCanvas');
      if (!c) return;
      var ctx = c.getContext('2d');
      var W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      var dirs = [
        { a: 0, l: 'N' }, { a: Math.PI / 4, l: 'NE' }, { a: Math.PI / 2, l: 'E' },
        { a: 3 * Math.PI / 4, l: 'SE' }, { a: Math.PI, l: 'S' },
        { a: -3 * Math.PI / 4, l: 'SW' }, { a: -Math.PI / 2, l: 'W' }, { a: -Math.PI / 4, l: 'NW' }
      ];
      ctx.font = '900 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      dirs.forEach(function(d) {
        var diff = Math.atan2(Math.sin(d.a + game3D.yaw), Math.cos(d.a + game3D.yaw));
        if (Math.abs(diff) < 1.3) {
          var x = W / 2 + (diff / 1.3) * (W / 2 - 16);
          ctx.fillStyle = (d.l === 'N' || d.l === 'S') ? '#fde047' : '#bae6fd';
          ctx.fillText(d.l, x, 15);
        }
      });
    }

    function render3DGameLoop() {
      requestAnimationFrame(render3DGameLoop);
      if (currentSlide !== 14) return;
      try {
        initThreeCastleWorld();
        if (!threeCtx.renderer || !threeCtx.scene || !threeCtx.camera) return;

        var dt = threeCtx.clock ? Math.min(0.05, threeCtx.clock.getDelta()) : 0.016;
        var now = performance.now() * 0.001;

        if (game3D.keys.turnL) game3D.yaw += 0.036;
        if (game3D.keys.turnR) game3D.yaw -= 0.036;

        var spd = game3D.keys.sprint ? 0.34 : 0.21;
        var sin = Math.sin(game3D.yaw);
        var cos = Math.cos(game3D.yaw);

        if (game3D.keys.fwd) { game3D.x -= sin * spd; game3D.z -= cos * spd; }
        if (game3D.keys.back) { game3D.x += sin * spd; game3D.z += cos * spd; }
        if (game3D.keys.left) { game3D.x -= cos * spd; game3D.z += sin * spd; }
        if (game3D.keys.right) { game3D.x += cos * spd; game3D.z -= sin * spd; }

        if (game3D.keys.up && game3D.jetFuel > 0) {
          game3D.vy = 0.22;
          game3D.jetFuel = Math.max(0, game3D.jetFuel - 0.55);
        } else {
          var floorY = 0;
          if (game3D.y > 10 && Math.hypot(game3D.x, game3D.z - 12) < 15) floorY = 14;
          else if (game3D.y > 10 && Math.hypot(game3D.x - 24, game3D.z + 12) < 10) floorY = 14;
          else if (game3D.y < -3) floorY = -8;

          game3D.vy -= 0.014;
          game3D.y += game3D.vy;
          if (game3D.y <= floorY) {
            game3D.y = floorY;
            game3D.vy = 0;
            game3D.jetFuel = Math.min(100, game3D.jetFuel + 0.45);
          }
        }
        if (game3D.keys.up) game3D.y = Math.min(28, game3D.y + game3D.vy);

        game3D.x = Math.max(-42, Math.min(42, game3D.x));
        game3D.z = Math.max(-44, Math.min(34, game3D.z));

        threeCtx.jumpPads.forEach(function(jp) {
          if (Math.hypot(game3D.x - jp.x, game3D.z - jp.z) < 1.9 && Math.abs(game3D.y - jp.y) < 1.8) {
            game3D.y = jp.targetY;
            game3D.vy = 0;
            playSound(300, 960, 0.28, 'sine');
            showToast('🚀 ' + jp.label);
          }
        });

        threeCtx.camera.position.set(game3D.x, game3D.y + 2.35, game3D.z);
        threeCtx.camera.rotation.order = 'YXZ';
        threeCtx.camera.rotation.y = game3D.yaw;
        threeCtx.camera.rotation.x = game3D.pitch;

        if (threeCtx.flashlight && threeCtx.flashlightTarget) {
          threeCtx.flashlight.position.copy(threeCtx.camera.position);
          threeCtx.flashlightTarget.position.set(
            game3D.x - sin * 20,
            game3D.y + 2.2 + Math.sin(game3D.pitch) * 15,
            game3D.z - cos * 20
          );
        }

        game3D.crystals.forEach(function(cr, i) {
          if (cr.mesh && !cr.broken) {
            cr.mesh.rotation.y = now * 1.4 + i;
            cr.mesh.position.y = cr.y + 1.5 + Math.sin(now * 2.2 + i) * 0.22;
          }
        });

        game3D.secrets.forEach(function(s) {
          var grp = threeCtx.secretMeshes[s.id];
          if (grp && grp.userData && grp.userData.orb) {
            grp.userData.orb.rotation.y = now * 1.8;
          }
        });

        game3D.gltfMixers.forEach(function(item, idx) {
          item.mixer.update(dt);
          if (item.mesh) {
            var a = now * 0.55 + item.phase;
            item.mesh.position.x = Math.cos(a) * (10 + idx * 3);
            item.mesh.position.z = Math.sin(a) * (10 + idx * 3);
            item.mesh.rotation.y = -a;
          }
        });

        if (game3D.boss.active && game3D.boss.mesh) {
          game3D.boss.angle += 0.018;
          game3D.boss.x = Math.cos(game3D.boss.angle) * 10;
          game3D.boss.z = -28 + Math.sin(game3D.boss.angle) * 6;
          game3D.boss.mesh.position.set(game3D.boss.x, 3.5 + Math.sin(now * 3) * 0.6, game3D.boss.z);
          game3D.boss.mesh.rotation.y += 0.03;
        }

        for (var ei = game3D.activeEffects.length - 1; ei >= 0; ei--) {
          var ef = game3D.activeEffects[ei];
          ef.t += dt;
          if (ef.ring) ef.ring.scale.multiplyScalar(1.08);
          if (ef.beam) ef.beam.material.opacity = Math.max(0, 1 - ef.t * 2.2);
          if (ef.t > 0.48) {
            if (ef.beam) threeCtx.scene.remove(ef.beam);
            if (ef.ring) threeCtx.scene.remove(ef.ring);
            game3D.activeEffects.splice(ei, 1);
          }
        }

        var jetBar = document.getElementById('hudJetBar');
        if (jetBar) jetBar.style.width = Math.round(game3D.jetFuel) + '%';
        var coords = document.getElementById('hudCoords');
        if (coords) coords.textContent = 'X:' + Math.round(game3D.x) + ' Z:' + Math.round(game3D.z) + ' Y:' + Math.round(game3D.y);

        var nearPrompt = document.getElementById('owl3DPrompt');
        if (nearPrompt) {
          var foundNear = null;
          game3D.owls.forEach(function(o) {
            if (Math.hypot(o.x - game3D.x, o.z - game3D.z) < 7.5 && Math.abs(o.y - game3D.y) < 4.5) foundNear = '💬 Paina [E]: Puhu (' + o.name + ')';
          });
          game3D.secrets.forEach(function(s) {
            if (!game3D.secretsFound[s.id] && Math.hypot(s.x - game3D.x, s.z - game3D.z) < 5.5 && Math.abs(s.y - game3D.y) < 4.5) {
              foundNear = '🔍 Paina [E]: Tutki salaisuutta (' + s.name + ')';
            }
          });
          nearPrompt.style.display = foundNear ? 'block' : 'none';
          if (foundNear) nearPrompt.textContent = foundNear;
        }

        drawCompassStrip();
        threeCtx.renderer.render(threeCtx.scene, threeCtx.camera);
      } catch (err) {}
    }

    window.addEventListener('keydown', function(e) {
      if (currentSlide !== 14) {
        if (e.key === 'ArrowRight') window.nextSlide();
        else if (e.key === 'ArrowLeft') window.prevSlide();
        return;
      }
      var k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') game3D.keys.fwd = true;
      if (k === 's' || e.key === 'ArrowDown') game3D.keys.back = true;
      if (k === 'a') game3D.keys.left = true;
      if (k === 'd') game3D.keys.right = true;
      if (e.key === 'ArrowLeft') game3D.keys.turnL = true;
      if (e.key === 'ArrowRight') game3D.keys.turnR = true;
      if (e.key === ' ') { game3D.keys.up = true; e.preventDefault(); }
      if (e.key === 'Shift') game3D.keys.sprint = true;
      if (k === 'e') window.interact3DCastle();
      if (k === 'f') window.shoot3D();
      if (k === 'r') window.repair3DHall();
      if (k === 'm') window.toggleCastleMapModal();
      if (k === 'l') window.toggleFlashlight();
      if (k >= '1' && k <= '5') window.set3DWeapon(parseInt(k, 10));
    });

    window.addEventListener('keyup', function(e) {
      var k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') game3D.keys.fwd = false;
      if (k === 's' || e.key === 'ArrowDown') game3D.keys.back = false;
      if (k === 'a') game3D.keys.left = false;
      if (k === 'd') game3D.keys.right = false;
      if (e.key === 'ArrowLeft') game3D.keys.turnL = false;
      if (e.key === 'ArrowRight') game3D.keys.turnR = false;
      if (e.key === ' ') game3D.keys.up = false;
      if (e.key === 'Shift') game3D.keys.sprint = false;
    });

    // =========================================================================
    // FORBIDDEN DOOMSDAY WEAPON (☢️ OMEGA-ASE), 4K CRUMBLING DISINTEGRATION,
    // PITCH-BLACK DARKNESS, "🔫 AMMU PÖLLÖÄ", "💵 VÄÄRENNETYT MASSIT" & 4K REPAIR
    // =========================================================================
    var fakeMoneyInterval = null;
    var fakeMoneySeconds = 8;

    function resetDarknessOwlInvoiceUI() {
      clearInterval(fakeMoneyInterval);
      var stamp = document.getElementById('owlPaidStamp');
      if (stamp) {
        stamp.className = 'paid-stamp';
        stamp.textContent = 'HYVÄKSYTTY ✅';
      }
      var card = document.getElementById('owlSpotlightCard');
      if (card) card.classList.remove('thrown-by-owl');
      var laser = document.getElementById('owlLaserSight');
      if (laser) laser.style.display = 'none';
      var redEyes = document.getElementById('owlRedEyesOverlay');
      if (redEyes) redEyes.style.display = 'none';
      var topTag = document.getElementById('darknessTopTag');
      if (topTag) {
        topTag.style.color = '#fde047';
        topTag.textContent = '🌑 SIVUSTO MURENNETTU PALASIKSI • JÄLJELLÄ VAIN TÄYDELLINEN PIMEYS 🌑';
      }
      var title = document.getElementById('darknessOwlTitle');
      if (title) {
        title.className = '';
        title.style.fontSize = '24px';
        title.textContent = '🦉 ”HUU! Varoitin sinua! Koko sivusto mureni palasiksi!”';
      }
      var desc = document.getElementById('darknessOwlDesc');
      if (desc) {
        desc.innerHTML = 'Ammuit Tuomion Omega-Aseella ja murskasit koko O-järjestön 4K-sivuston kivisirpaleiksi ja tuhkaksi. Täällä pimeydessä ei ole enää yhtäkään diaa jäljellä – ellet maksa virallista <strong>Pöllöjen Korjauslaskua</strong>!';
      }
      var invNum = document.getElementById('invoiceNumberTitle');
      if (invNum) invNum.textContent = '🧾 PÖLLÖJEN KORJAUSLASKU #404-OMEGA';
      var r1 = document.getElementById('invRow1Price');
      if (r1) r1.textContent = '499,99 €';
      var r2 = document.getElementById('invRow2Price');
      if (r2) r2.textContent = '400,00 €';
      var r3L = document.getElementById('invRow3Label');
      if (r3L) r3L.textContent = '• Yöpöllön hätäpäivystyslisä pimeydessä:';
      var r3P = document.getElementById('invRow3Price');
      if (r3P) {
        r3P.style.color = '#e2e8f0';
        r3P.textContent = '100,00 €';
      }
      var tot = document.getElementById('invTotalAmount');
      if (tot) {
        tot.style.color = '#34d399';
        tot.textContent = '999,99 € (tai 1 Kultainen Tonnikala & Kaviaari)';
      }
      var normBtns = document.getElementById('owlNormalButtons');
      if (normBtns) normBtns.style.display = 'flex';
      var penBtns = document.getElementById('owlPenaltyButtons');
      if (penBtns) penBtns.style.display = 'none';
      var fakeBtns = document.getElementById('owlFakeMoneyButtons');
      if (fakeBtns) fakeBtns.style.display = 'none';
    }

    window.openOmegaWarningModal = function() {
      playSound(160, 55, 0.4, 'sawtooth');
      var m = document.getElementById('omegaWarningModal');
      if (m) m.classList.add('show');
    };

    window.closeOmegaWarningModal = function() {
      var m = document.getElementById('omegaWarningModal');
      if (m) m.classList.remove('show');
      if (game3D.weapon === 5) window.set3DWeapon(1);
    };

    window.confirmOmegaDoomsday = function() {
      var m = document.getElementById('omegaWarningModal');
      if (m) m.classList.remove('show');

      resetDarknessOwlInvoiceUI();

      // Deep multi-stage crumbling earthquake sound
      playSound(240, 22, 1.55, 'sawtooth');
      setTimeout(function() { playSound(95, 16, 1.35, 'triangle'); }, 220);
      setTimeout(function() { playSound(68, 14, 1.15, 'square'); }, 540);

      var body = document.getElementById('appBody');
      if (body) body.classList.add('quake');

      var activeSlide = document.getElementById('slide-' + currentSlide);
      if (activeSlide) activeSlide.classList.add('crumbling-collapse');

      var fx = document.getElementById('orbital-fx-layer');

      // Stage 1: Glowing Golden, Cyan & Crimson Fracture Cracks Across Viewport
      var cracks = document.createElement('div');
      cracks.style.cssText = 'position:fixed;inset:0;z-index:191;pointer-events:none;filter:drop-shadow(0 0 18px #fde047);';
      cracks.innerHTML = '<svg width="100%" height="100%" viewBox="0 0 1200 700" preserveAspectRatio="none">' +
        '<g stroke="#fde047" stroke-width="3.5" opacity="0.96">' +
        '<path d="M600,350 L420,180 L210,120 L40,20" fill="none"/>' +
        '<path d="M600,350 L780,190 L980,95 L1180,15" fill="none"/>' +
        '<path d="M600,350 L820,460 L1040,590 L1190,685" fill="none"/>' +
        '<path d="M600,350 L380,490 L170,610 L15,690" fill="none"/>' +
        '<path d="M420,180 L540,40 M780,190 L690,25 M380,490 L520,685 M820,460 L680,690" fill="none" stroke="#38bdf8" stroke-width="2.5"/>' +
        '<polygon points="460,250 740,235 810,455 410,475" fill="none" stroke="#ef4444" stroke-width="4"/>' +
        '</g></svg>';
      fx.appendChild(cracks);

      // Stage 2: 155 3D-shaded crystalline, gold, obsidian & ember shards tumbling under gravity
      var W = window.innerWidth;
      var H = window.innerHeight;
      var cols = [
        'linear-gradient(135deg,#fde047,#b45309)',
        'linear-gradient(135deg,#38bdf8,#0f172a)',
        'linear-gradient(135deg,#475569,#020617)',
        'linear-gradient(135deg,#ef4444,#450a0a)',
        'linear-gradient(135deg,#a855f7,#1e1b4b)',
        'linear-gradient(135deg,#334155,#090d18)'
      ];
      var shapes = [
        'polygon(14% 0%, 86% 6%, 100% 68%, 72% 100%, 12% 92%, 0% 34%)',
        'polygon(6% 18%, 92% 0%, 100% 82%, 48% 100%, 0% 74%)',
        'polygon(24% 0%, 100% 22%, 84% 100%, 0% 88%)',
        'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
      ];

      for (var i = 0; i < 155; i++) {
        var chunk = document.createElement('div');
        var isEmber = i % 5 === 0;
        var cw = isEmber ? (8 + Math.random() * 14) : (26 + Math.random() * 76);
        var ch = isEmber ? cw : (22 + Math.random() * 68);
        var sx = (W * 0.04) + Math.random() * (W * 0.92);
        var sy = (H * 0.04) + Math.random() * (H * 0.88);
        chunk.style.cssText =
          'position:fixed;z-index:193;pointer-events:none;width:' + cw + 'px;height:' + ch + 'px;' +
          'left:' + sx + 'px;top:' + sy + 'px;background:' + (isEmber ? '#fde047' : cols[i % cols.length]) + ';' +
          (isEmber ? 'border-radius:50%;box-shadow:0 0 22px #fde047,0 0 40px #ef4444;' :
            'clip-path:' + shapes[i % shapes.length] + ';border:1px solid rgba(253,224,71,0.55);box-shadow:inset -5px -5px 12px rgba(0,0,0,0.85), 0 14px 28px rgba(0,0,0,0.92);');
        fx.appendChild(chunk);

        var driftX = (Math.random() - 0.5) * 340;
        var popY = -30 - Math.random() * 85;
        var dropY = H - sy + 200 + Math.random() * 360;
        var rotZ = (Math.random() - 0.5) * 860;
        var delay = Math.random() * 310;

        chunk.animate([
          { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
          { transform: 'translate(calc(-50% + ' + (driftX * 0.35) + 'px), calc(-50% + ' + popY + 'px)) scale(1.06) rotate(' + (rotZ * 0.3) + 'deg)', opacity: 1, offset: 0.24 },
          { transform: 'translate(calc(-50% + ' + driftX + 'px), calc(-50% + ' + dropY + 'px)) scale(0.18) rotate(' + rotZ + 'deg)', opacity: 0 }
        ], {
          duration: 1120 + Math.random() * 520,
          delay: delay,
          easing: 'cubic-bezier(0.45, 0.02, 0.75, 0.35)',
          fill: 'forwards'
        });

        setTimeout(function(el) { try { el.remove(); } catch (err) {} }, 1750, chunk);
      }

      setTimeout(function() {
        try { cracks.remove(); } catch (e) {}
        if (body) body.classList.remove('quake');
        if (activeSlide) activeSlide.classList.remove('crumbling-collapse');
        var dark = document.getElementById('omegaDarknessOverlay');
        if (dark) dark.classList.add('show');
      }, 1420);
    };

    // BUTTON 4: "💵 Maksa, mutta väärennetyt massit" -> OWL RAGES, FLINGS FAKE BILLS, DEMANDS 100 M € OR THROWS CASH AT YOUR HEAD!
    window.payWithCounterfeitMoney = function() {
      clearInterval(fakeMoneyInterval);
      playSound(480, 95, 0.5, 'sawtooth');
      setTimeout(function() { playSound(190, 52, 0.65, 'square'); }, 160);

      // 1) Slam "💸 VÄÄRENNETYT MASSIT!" stamp
      var stamp = document.getElementById('owlPaidStamp');
      if (stamp) {
        stamp.textContent = '💸 VÄÄRENNETYT MASSIT!';
        stamp.className = 'paid-stamp forbidden stamped';
      }

      // 2) Owl flings 42 counterfeit banknotes flying across the screen
      var fx = document.getElementById('orbital-fx-layer');
      if (fx) {
        var billIcons = ['💵', '💸', '💴', '💶', '🚫0€'];
        for (var i = 0; i < 42; i++) {
          var bill = document.createElement('div');
          bill.style.cssText = 'position:fixed;left:50%;top:45%;z-index:215;pointer-events:none;font-size:' + (24 + Math.random() * 24) + 'px;font-weight:900;color:#fde047;filter:drop-shadow(0 0 14px #ef4444);';
          bill.textContent = billIcons[i % billIcons.length];
          fx.appendChild(bill);
          var ang = Math.random() * Math.PI * 2;
          var dist = 160 + Math.random() * 560;
          var tx = Math.cos(ang) * dist;
          var ty = Math.sin(ang) * dist;
          var rot = (Math.random() - 0.5) * 1440;
          bill.animate([
            { transform: 'translate(-50%,-50%) scale(0.4) rotate(0deg)', opacity: 1 },
            { transform: 'translate(calc(-50% + ' + (tx * 0.65) + 'px), calc(-50% + ' + (ty * 0.65 - 60) + 'px)) scale(1.25) rotate(' + (rot * 0.5) + 'deg)', opacity: 1, offset: 0.4 },
            { transform: 'translate(calc(-50% + ' + tx + 'px), calc(-50% + ' + (ty + 220) + 'px)) scale(0.3) rotate(' + rot + 'deg)', opacity: 0 }
          ], { duration: 1150 + Math.random() * 450, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' });
          setTimeout(function(el) { try { el.remove(); } catch (e) {} }, 1650, bill);
        }
      }

      // 3) Shake card and turn Owl's eyes blazing crimson
      var card = document.getElementById('owlSpotlightCard');
      if (card) {
        card.classList.remove('thrown-by-owl');
        void card.offsetWidth;
        card.classList.add('thrown-by-owl');
      }
      var redEyes = document.getElementById('owlRedEyesOverlay');
      if (redEyes) redEyes.style.display = 'block';

      var topTag = document.getElementById('darknessTopTag');
      if (topTag) {
        topTag.style.color = '#ef4444';
        topTag.textContent = '💸 VÄÄRENNETTYJÄ MASSEJA HAVAITTU! PÖLLÖ HEITTI SETELIT ILMAAN! 💸';
      }

      var title = document.getElementById('darknessOwlTitle');
      if (title) {
        title.className = 'owl-rage-threat';
        title.style.fontSize = '20px';
        title.textContent = '🦉💸 ”VÄÄRENNETTYJÄ MASSEJA?! MAKSAT 100 M € TAI HEITÄN NÄMÄ SUN PÄÄHÄN JA KUOLET!”';
      }

      var desc = document.getElementById('darknessOwlDesc');
      if (desc) {
        desc.innerHTML = 'Yritit huijata Pöllöä <strong>väärennetyillä masseilla</strong>! Pöllö repi setelit ilmaan ja vaatii nyt <strong>100 miljoonaa (100 M €)</strong> – ellet maksa heti, Pöllö viskaa väärennetyt massit suoraan päähäsi ja kuolet!';
      }

      var invNum = document.getElementById('invoiceNumberTitle');
      if (invNum) invNum.textContent = '🧾 PETOSSAKKO #100M-VÄÄRENNÖS';
      var r3L = document.getElementById('invRow3Label');
      if (r3L) r3L.textContent = '• 💸 Väärennettyjen massien yritys (Rangaistusmaksu):';
      var r3P = document.getElementById('invRow3Price');
      if (r3P) {
        r3P.style.color = '#ef4444';
        r3P.textContent = '100 000 000 € (100 M €)';
      }
      var tot = document.getElementById('invTotalAmount');
      if (tot) {
        tot.style.color = '#fde047';
        tot.textContent = '100 M € (100 MILJOONAA € — MAKSA HETI TAI SAAT MASSIT PÄÄHÄN!)';
      }

      var normBtns = document.getElementById('owlNormalButtons');
      if (normBtns) normBtns.style.display = 'none';
      var penBtns = document.getElementById('owlPenaltyButtons');
      if (penBtns) penBtns.style.display = 'none';
      var fakeBtns = document.getElementById('owlFakeMoneyButtons');
      if (fakeBtns) fakeBtns.style.display = 'flex';

      fakeMoneySeconds = 8;
      var tCount = document.getElementById('fakeMoneyTimerCount');
      if (tCount) tCount.textContent = String(fakeMoneySeconds);

      fakeMoneyInterval = setInterval(function() {
        fakeMoneySeconds--;
        if (tCount) tCount.textContent = String(Math.max(0, fakeMoneySeconds));
        playSound(440, 220, 0.12, 'square');
        if (fakeMoneySeconds <= 0) {
          clearInterval(fakeMoneyInterval);
          window.triggerFakeMoneyHeadThrow();
        }
      }, 1000);

      showToast('💸 Pöllö raivostui väärennetyistä masseista! Maksa 100 M € 8 sekunnissa tai saat massit päähäsi!');
    };

    // OWL HURLS THE HEAVY BUNDLE OF COUNTERFEIT CASH STRAIGHT AT YOUR HEAD -> GLASS SHATTERS & YOU DIE!
    window.triggerFakeMoneyHeadThrow = function() {
      clearInterval(fakeMoneyInterval);
      playSound(320, 28, 0.85, 'sawtooth');

      var fx = document.getElementById('orbital-fx-layer');
      if (fx) {
        var wad = document.createElement('div');
        wad.style.cssText = 'position:fixed;left:50%;top:42%;z-index:240;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#166534,#14532d,#052e16);border:6px solid #fde047;border-radius:24px;padding:18px 34px;box-shadow:0 0 90px #ef4444,0 30px 80px #000;color:#fde047;font-weight:900;text-align:center;';
        wad.innerHTML = '<div style="font-size:64px;line-height:1;">💵🧱💸</div><div style="font-size:22px;letter-spacing:2px;margin-top:6px;">VÄÄRENNETYT MASSIT (100 KG)</div>';
        fx.appendChild(wad);

        wad.animate([
          { transform: 'translate(-50%,-50%) scale(0.15) rotate(-25deg)', opacity: 1 },
          { transform: 'translate(-50%,-50%) scale(1.6) rotate(12deg)', opacity: 1, offset: 0.55 },
          { transform: 'translate(-50%,-50%) scale(5.8) rotate(-18deg)', opacity: 1 }
        ], { duration: 640, easing: 'cubic-bezier(0.55, 0.05, 0.67, 0.19)', fill: 'forwards' });

        setTimeout(function() {
          try { wad.remove(); } catch (e) {}
          playSound(95, 18, 0.9, 'square');
          var smash = document.createElement('div');
          smash.style.cssText = 'position:fixed;inset:0;z-index:245;pointer-events:none;background:radial-gradient(circle,rgba(239,68,68,0.85) 0%,rgba(255,255,255,0.75) 30%,transparent 75%);';
          smash.innerHTML = '<svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="none"><g stroke="#ffffff" stroke-width="4" opacity="0.95"><line x1="500" y1="300" x2="40" y2="10"/><line x1="500" y1="300" x2="960" y2="25"/><line x1="500" y1="300" x2="980" y2="580"/><line x1="500" y1="300" x2="20" y2="575"/><circle cx="500" cy="300" r="140" fill="none" stroke="#fde047" stroke-width="5"/></g></svg>';
          fx.appendChild(smash);
          setTimeout(function() { try { smash.remove(); } catch (e) {} }, 900);
        }, 620);
      }

      setTimeout(function() {
        var dark = document.getElementById('omegaDarknessOverlay');
        if (dark) dark.classList.remove('show');
        showDeathModal(
          '🦉💵💥',
          'KUOLIT! PÖLLÖ HEITTI VÄÄRENNETYT MASSIT SUN PÄÄHÄN!',
          'Yritit maksaa Pöllölle väärennetyillä masseilla etkä suostunut maksamaan 100 miljoonan (100 M €) sakkoa, joten raivostunut Pöllö heitti painavan setelipinkan suoraan päähäsi!',
          '💡 Vinkki: Maksa Pöllön lasku rehellisesti tai maksa 100 M € sakko ajoissa nähdäksesi kauniin 4K-korjausanimaation!'
        );
      }, 1180);
    };

    // CLICKING "🔫 AMMU PÖLLÖÄ": FORBIDDEN STAMP, OWL THROWS WEAPON & YOU AWAY, DEMANDS 1000000000 MILJOONAA!
    window.shootDarknessOwl = function() {
      clearInterval(fakeMoneyInterval);
      // Loud alarm & deflection shockwave sound
      playSound(520, 110, 0.55, 'sawtooth');
      setTimeout(function() { playSound(180, 42, 0.75, 'square'); }, 180);

      // 1) Slam red "🚫 KIELLETTY!" stamp instead of approved stamp
      var stamp = document.getElementById('owlPaidStamp');
      if (stamp) {
        stamp.textContent = '🚫 KIELLETTY!';
        stamp.className = 'paid-stamp forbidden stamped';
      }

      // 2) Visual animation of your weapon being violently thrown spinning off-screen by the Owl
      var fx = document.getElementById('orbital-fx-layer');
      if (fx) {
        var flungGun = document.createElement('div');
        flungGun.style.cssText = 'position:fixed;left:50%;top:48%;z-index:215;pointer-events:none;font-size:64px;filter:drop-shadow(0 0 30px #ef4444);';
        flungGun.textContent = '🔫💥🦉';
        fx.appendChild(flungGun);
        flungGun.animate([
          { transform: 'translate(-50%,-50%) scale(0.8) rotate(0deg)', opacity: 1 },
          { transform: 'translate(-180px,-140px) scale(1.6) rotate(-380deg)', opacity: 1, offset: 0.35 },
          { transform: 'translate(780px, -520px) scale(0.2) rotate(1440deg)', opacity: 0 }
        ], { duration: 920, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' });
        setTimeout(function() { try { flungGun.remove(); } catch (e) {} }, 950);
      }

      // 3) Owl violently throws the player/card backward
      var card = document.getElementById('owlSpotlightCard');
      if (card) {
        card.classList.remove('thrown-by-owl');
        void card.offsetWidth;
        card.classList.add('thrown-by-owl');
      }

      // 4) Activate Owl's fiery red eyes, laser sight & 1000000000 miljoonaa ultimatum
      var laser = document.getElementById('owlLaserSight');
      if (laser) laser.style.display = 'block';
      var redEyes = document.getElementById('owlRedEyesOverlay');
      if (redEyes) redEyes.style.display = 'block';

      var topTag = document.getElementById('darknessTopTag');
      if (topTag) {
        topTag.style.color = '#ef4444';
        topTag.textContent = '🚫 HYÖKKÄYS PÖLLÖÄ KOHTI KIELLETTY! PÖLLÖ HEITTI ASEESI POIS! 🚫';
      }

      var title = document.getElementById('darknessOwlTitle');
      if (title) {
        title.className = 'owl-rage-threat';
        title.style.fontSize = '22px';
        title.textContent = '🦉💥 ”MAKSAT 1000000000 MILJOONAA TAI AMMUN SINUA!”';
      }

      var desc = document.getElementById('darknessOwlDesc');
      if (desc) {
        desc.innerHTML = 'Yritit ampua Pöllöä pimeydessä! Pöllö nappasi luodin, löi laskuun <strong>🚫 KIELLETTY!</strong> -leiman, <strong>heitti aseesi ja sinut pois</strong> ja tähtää nyt sinua omalla Orbital Railgunillaan!';
      }

      var invNum = document.getElementById('invoiceNumberTitle');
      if (invNum) invNum.textContent = '🧾 RANGAISTUSLASKU #999-KIELLETTY';
      var r3L = document.getElementById('invRow3Label');
      if (r3L) r3L.textContent = '• 🚫 Pöllön ampumisyritys (Rangaistussakko):';
      var r3P = document.getElementById('invRow3Price');
      if (r3P) {
        r3P.style.color = '#ef4444';
        r3P.textContent = '1 000 000 000 MILJOONAA €';
      }
      var tot = document.getElementById('invTotalAmount');
      if (tot) {
        tot.style.color = '#fde047';
        tot.textContent = '1000000000 MILJOONAA € (MAKSA HETI TAI PÖLLÖ AMPUU!)';
      }

      var normBtns = document.getElementById('owlNormalButtons');
      if (normBtns) normBtns.style.display = 'none';
      var penBtns = document.getElementById('owlPenaltyButtons');
      if (penBtns) penBtns.style.display = 'flex';

      showToast('🚫 KIELLETTY! Pöllö heitti sinut pois: ”MAKSAT 1000000000 MILJOONAA TAI AMMUN SINUA!”');
    };

    window.refuseOwlBillionPayment = function() {
      var dark = document.getElementById('omegaDarknessOverlay');
      if (dark) dark.classList.remove('show');
      spawnOrbitalBeamFX(window.innerWidth / 2, window.innerHeight / 2, 720);
      setTimeout(function() {
        showDeathModal(
          '🦉🛰️💥',
          'PÖLLÖ AMPUI SINUT! (1000000000 MILJOONAA MAKSAMATTA)',
          'Kieltäydyit maksamasta Pöllölle 1000000000 miljoonaa sen jälkeen kun yritit ampua sitä pimeydessä!',
          '💡 Vinkki: Kun Pöllö vaatii maksua korjauksesta, maksa lasku niin näet kauniin 4K-korjausanimaation!'
        );
      }, 780);
    };

    function playHarpChord(notes) {
      if (!audioOn) return;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!audioCtx && AC) audioCtx = new AC();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        notes.forEach(function(freq, idx) {
          setTimeout(function() {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.16, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 1.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 1.1);
          }, idx * 95);
        });
      } catch (e) {}
    }

    window.payOwlRepairInvoice = function(method) {
      clearInterval(fakeMoneyInterval);
      var stamp = document.getElementById('owlPaidStamp');
      if (stamp) {
        stamp.className = 'paid-stamp stamped';
        stamp.textContent = method === 'billion'
          ? 'HYVÄKSYTTY: 1000000000 MILJOONAA ✅'
          : (method === 'hundred_million'
            ? 'HYVÄKSYTTY: 100 M € ✅'
            : (method === 'tuna' ? 'HYVÄKSYTTY (TONNIKALA) ✅' : 'HYVÄKSYTTY (999,99 €) ✅'));
      }
      var laser = document.getElementById('owlLaserSight');
      if (laser) laser.style.display = 'none';
      playHarpChord([523.25, 659.25, 783.99, 1046.50]);

      setTimeout(function() {
        var dark = document.getElementById('omegaDarknessOverlay');
        if (dark) dark.classList.remove('show');
        run4KQuantumRepairSequence();
      }, 720);
    };

    function run4KQuantumRepairSequence() {
      var ov = document.getElementById('omegaQuantumRepairOverlay');
      var canvas = document.getElementById('quantumRepairCanvas');
      var bar = document.getElementById('repairProgressBar');
      var pctLbl = document.getElementById('repairPercentLabel');
      var stTitle = document.getElementById('repairStageTitle');
      var stSub = document.getElementById('repairStageSub');
      if (!ov || !canvas) return;

      ov.classList.add('show');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      var ctx = canvas.getContext('2d');

      var particles = [];
      for (var i = 0; i < 110; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 1.5 + Math.random() * 3.5,
          vy: -1.5 - Math.random() * 3.2,
          vx: (Math.random() - 0.5) * 1.4,
          col: i % 3 === 0 ? '#fde047' : (i % 3 === 1 ? '#34d399' : '#38bdf8')
        });
      }

      var start = performance.now();
      var duration = 3400;
      playHarpChord([261.63, 329.63, 392.00, 523.25, 659.25, 783.99]);
      setTimeout(function() { playHarpChord([349.23, 440.00, 523.25, 698.46, 880.00]); }, 1200);
      setTimeout(function() { playHarpChord([523.25, 659.25, 783.99, 1046.50, 1318.51]); }, 2350);

      function step(now) {
        var p = Math.min(1, (now - start) / duration);
        var pct = Math.round(p * 100);
        if (bar) bar.style.width = pct + '%';
        if (pctLbl) pctLbl.textContent = pct + '%';

        if (p < 0.34) {
          stTitle.textContent = '1/3 • Kootaan särkyneitä 4K-pikseleitä ja valokuvia...';
          stSub.textContent = 'Pöllöjen kultti punoo kultaisia kvanttisäikeitä pimeyden halki...';
        } else if (p < 0.72) {
          stTitle.textContent = '2/3 • Palautetaan kaikki 14 diaa ja O-järjestön tietokanta...';
          stSub.textContent = 'Tornado-moottori, kutsukirje, tonnikala ja 11 yhtiötä kalibroidaan...';
        } else {
          stTitle.textContent = '3/3 • Viimeistellään 3D Pöllöjen Linna & 360° Tähtitaivas!';
          stSub.textContent = 'Kaikki vauriot ja kraatterit on puhdistettu 100 % tarkkuudella!';
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var cx = canvas.width / 2, cy = canvas.height / 2;

        // Aurora Borealis harmonic wave
        var grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(canvas.width, canvas.height) * 0.65);
        grad.addColorStop(0, 'rgba(253, 224, 71, ' + (0.32 * Math.sin(p * Math.PI)) + ')');
        grad.addColorStop(0.5, 'rgba(16, 185, 129, ' + (0.28 * Math.sin(p * Math.PI)) + ')');
        grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rotating Sacred Geometry Golden & Emerald Rings
        for (var rIdx = 1; rIdx <= 4; rIdx++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((now * 0.0012 * (rIdx % 2 === 0 ? 1 : -1)) + rIdx);
          ctx.strokeStyle = rIdx % 2 === 0 ? 'rgba(253, 224, 71, 0.75)' : 'rgba(52, 211, 153, 0.75)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([14, 10]);
          ctx.beginPath();
          ctx.arc(0, 0, 75 * rIdx * (0.4 + p * 0.7), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Rising Golden & Emerald Starlight Particles
        particles.forEach(function(pt) {
          pt.y += pt.vy;
          pt.x += pt.vx;
          if (pt.y < 0) pt.y = canvas.height;
          ctx.fillStyle = pt.col;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
          ctx.fill();
        });

        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          // Restore all damaged elements, holes, and 3D crystals
          var holes = document.getElementById('holesLayer');
          if (holes) holes.innerHTML = '';
          document.querySelectorAll('.orbital-damaged').forEach(function(el) {
            el.classList.remove('orbital-damaged');
            el.style.transform = '';
          });
          if (game3D.weapon === 5) window.set3DWeapon(1);
          window.repair3DHall();

          setTimeout(function() {
            ov.classList.remove('show');
            showToast('🦉✨ KIITOS MAKSUSTA! Koko 4K-verkkosivusto ja 3D-linna on korjattu täydellisesti!');
          }, 320);
        }
      }
      requestAnimationFrame(step);
    }

    // =========================================================================
    // PURE-JS CLIENT-SIDE .ZIP ARCHIVE GENERATOR & .HTML DOWNLOADER
    // =========================================================================
    function makeCRC32Table() {
      var c, table = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[n] = c >>> 0;
      }
      return table;
    }

    function crc32Bytes(bytes, table) {
      var crc = 0 ^ (-1);
      for (var i = 0; i < bytes.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xFF];
      }
      return (crc ^ (-1)) >>> 0;
    }

    function createZipBlob(filesArray) {
      var enc = new TextEncoder();
      var crcTable = makeCRC32Table();
      var localParts = [];
      var centralParts = [];
      var offset = 0;

      filesArray.forEach(function(file) {
        var nameBytes = enc.encode(file.name);
        var dataBytes = enc.encode(file.content);
        var crc = crc32Bytes(dataBytes, crcTable);
        var len = dataBytes.length;

        // Local File Header (30 bytes + filename)
        var lfh = new Uint8Array(30 + nameBytes.length);
        var ldv = new DataView(lfh.buffer);
        ldv.setUint32(0, 0x04034b50, true);
        ldv.setUint16(4, 20, true);
        ldv.setUint16(6, 0x0800, true); // UTF-8 flag
        ldv.setUint16(8, 0, true);      // Store (no compression)
        ldv.setUint16(10, 0, true);
        ldv.setUint16(12, 0, true);
        ldv.setUint32(14, crc, true);
        ldv.setUint32(18, len, true);
        ldv.setUint32(22, len, true);
        ldv.setUint16(26, nameBytes.length, true);
        ldv.setUint16(28, 0, true);
        lfh.set(nameBytes, 30);

        localParts.push(lfh, dataBytes);

        // Central Directory Header (46 bytes + filename)
        var cdh = new Uint8Array(46 + nameBytes.length);
        var cdv = new DataView(cdh.buffer);
        cdv.setUint32(0, 0x02014b50, true);
        cdv.setUint16(4, 20, true);
        cdv.setUint16(6, 20, true);
        cdv.setUint16(8, 0x0800, true);
        cdv.setUint16(10, 0, true);
        cdv.setUint16(12, 0, true);
        cdv.setUint16(14, 0, true);
        cdv.setUint32(16, crc, true);
        cdv.setUint32(20, len, true);
        cdv.setUint32(24, len, true);
        cdv.setUint16(28, nameBytes.length, true);
        cdv.setUint16(30, 0, true);
        cdv.setUint16(32, 0, true);
        cdv.setUint16(34, 0, true);
        cdv.setUint16(36, 0, true);
        cdv.setUint32(38, 0, true);
        cdv.setUint32(42, offset, true);
        cdh.set(nameBytes, 46);

        centralParts.push(cdh);
        offset += lfh.length + len;
      });

      var cdSize = 0;
      centralParts.forEach(function(p) { cdSize += p.length; });

      // End of Central Directory Record (22 bytes)
      var eocd = new Uint8Array(22);
      var edv = new DataView(eocd.buffer);
      edv.setUint32(0, 0x06054b50, true);
      edv.setUint16(4, 0, true);
      edv.setUint16(6, 0, true);
      edv.setUint16(8, filesArray.length, true);
      edv.setUint16(10, filesArray.length, true);
      edv.setUint32(12, cdSize, true);
      edv.setUint32(16, offset, true);
      edv.setUint16(20, 0, true);

      var allBlobs = localParts.concat(centralParts, [eocd]);
      return new Blob(allBlobs, { type: 'application/zip' });
    }

    window.downloadZIP = function() {
      try {
        var fullHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
        var styleEl = document.querySelector('style');
        var scriptEls = document.querySelectorAll('script');
        var mainScript = scriptEls[scriptEls.length - 1];

        var readme = [
          "O-JÄRJESTÖ 4K MEGAREALISTINEN ESITYSSIVUSTO & 3D LINNA (14 SIVUA)",
          "=================================================================",
          "Tämä ZIP-paketti sisältää:",
          "1. index.html - Täydellinen 14-sivuinen 4K-sivusto ja Sivun 14 3D Pöllöjen Linna",
          "2. style.css  - Sivuston 4K-ulkoasu ja animaatiot",
          "3. script.js  - 3D-moottori, ääniefektit, aseet ja salaisuudet",
          "",
          "Käyttöohje:",
          "Pura ZIP-tiedosto omalle tietokoneellesi ja tuplaklikkaa 'index.html'!"
        ].join("\r\n");

        var zipBlob = createZipBlob([
          { name: "o_jarjesto_4k_sivusto/index.html", content: fullHtml },
          { name: "o_jarjesto_4k_sivusto/style.css", content: styleEl ? styleEl.textContent : "" },
          { name: "o_jarjesto_4k_sivusto/script.js", content: mainScript ? mainScript.textContent : "" },
          { name: "o_jarjesto_4k_sivusto/LUE_MINUT.txt", content: readme }
        ]);

        var url = URL.createObjectURL(zipBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'o_jarjesto_4k_sivusto.zip';
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 300);
        showToast('📦 Ladataan o_jarjesto_4k_sivusto.zip omalle koneellesi!');
      } catch (err) {
        showToast('⚠️ ZIP-latausvirhe: ' + err.message);
      }
    };

    window.downloadHTML = function() {
      try {
        var htmlContent = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
        var blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'o_jarjesto_4k_esitys.html';
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 250);
        showToast('📥 Ladataan o_jarjesto_4k_esitys.html omalle koneellesi!');
      } catch (err) {
        showToast('⚠️ Latausvirhe: ' + err.message);
      }
    };

    // Ambient Background Starfield for 2D Slides
    window.addEventListener('DOMContentLoaded', function() {
      buildDots();
      render3DGameLoop();
      var sc = document.getElementById('starCanvas');
      if (!sc) return;
      var ctx = sc.getContext('2d');
      function resizeStars() { sc.width = window.innerWidth; sc.height = window.innerHeight; }
      resizeStars();
      window.addEventListener('resize', resizeStars);
      var stars = [];
      for (var i = 0; i < 65; i++) {
        stars.push({ x: Math.random() * sc.width, y: Math.random() * sc.height, r: Math.random() * 1.8 + 0.4, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 });
      }
      function tickStars() {
        ctx.clearRect(0, 0, sc.width, sc.height);
        ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
        stars.forEach(function(s) {
          s.x = (s.x + s.vx + sc.width) % sc.width;
          s.y = (s.y + s.vy + sc.height) % sc.height;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        });
        requestAnimationFrame(tickStars);
      }
      tickStars();
    });
  