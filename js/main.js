// ===================================================================
// KODE JAVASCRIPT FINAL - VERSI YANG SUDAH DIPERBAIKI
// ===================================================================

// ===================================================================
// KONFIGURASI SUPABASE (ganti dengan kredensial project Supabase Anda)
// Lihat panduan di bagian bawah file ini atau file SUPABASE_SETUP.md
// ===================================================================
const SUPABASE_URL = "https://gaonwlkabonbnecaicdg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_4CUzcEpmgfkePJOkxiklNA_K0KIyVZ9";
let rsvpSupabase = null;
try {
  rsvpSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.error("Gagal inisialisasi Supabase:", e);
}

// Menjalankan semua kode setelah halaman HTML selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Sembunyikan cover dan content saat preloader aktif
  const cover = document.getElementById("cover");
  const content = document.getElementById("content");
  const preloader = document.getElementById("preloader");

  if (cover) cover.style.display = "none";
  // content tetap pakai class d-none dari HTML, jangan set inline style (akan bentrok saat remove d-none)

  // --- LOGIKA NAMA TAMU DARI URL (MENGGUNAKAN HASH '#') ---
  const guestName = decodeURIComponent(window.location.hash.substring(1)).replace(/\+/g, ' ').trim();
  const guestContainer = document.getElementById("guest-container");
  const guestNameElement = document.getElementById("guest-name");

  if (guestName && guestNameElement && guestContainer) {
    const formattedGuestName = guestName.replace(/\+/g, " ").trim();
    guestNameElement.textContent = formattedGuestName;
    guestContainer.style.display = "block";
  }

  // --- BAGIAN 1: DEKLARASI SEMUA ELEMEN ---
  const openButton = document.getElementById("open-invitation");
  const music = document.getElementById("gamelan-music");
  const musicController = document.getElementById("music-controller");
  const musicIcon = musicController ? musicController.querySelector("i") : null;
  let isMusicPlaying = false;
  const rsvpModalElement = document.getElementById("rsvpModal");
  const rsvpModal = rsvpModalElement
    ? new bootstrap.Modal(rsvpModalElement)
    : null;
  const form = document.getElementById("rsvp-form-modal");
  const submitButton = document.getElementById("submit-button");
  const buttonText = document.getElementById("button-text");
  const buttonSpinner = document.getElementById("button-spinner");
  const konfirmasiSelect = document.getElementById("konfirmasi");
  const jumlahTamuWrapper = document.getElementById("jumlah-tamu-wrapper");
  const wishWall = document.getElementById("wish-wall");
  const loadingWishes = document.getElementById("loading-wishes");
  const copyButtons = document.querySelectorAll(".btn-copy");
  const countdownContainer = document.getElementById("timer-container");
  const countdownExpired = document.getElementById("countdown-expired");
  const footer = document.getElementById("main-footer");
  // Sembunyikan saat cover tampil
  if (musicController) musicController.style.display = "none";
  if (footer) footer.style.display = "none";

  // --- PRELOADER LOGIC ---
  function finishPreloader() {
    if (!preloader) return;
    preloader.classList.add("loaded");

    // Tampilkan cover dengan animasi fade-in setelah preloader hilang
    setTimeout(() => {
      if (cover) {
        cover.style.display = "flex";
        cover.style.opacity = "0";
        cover.style.transition = "opacity 1.2s ease";
        requestAnimationFrame(() => {
          cover.style.opacity = "1";
        });
      }
    }, 600);

    // Bersihkan preloader dari DOM setelah transisi selesai
    setTimeout(() => {
      if (preloader) preloader.style.display = "none";
    }, 1400);
  }

  // Tunggu progress bar selesai (3.5s) + buffer agar animasi teks sempurna
  setTimeout(finishPreloader, 4200);

  // --- BAGIAN 2: FUNGSI PEMBANTU (HELPER FUNCTIONS) ---
  function addWishToWall(nama, ucapan, konfirmasi, id) {
    if (!wishWall) return;
    let statusBadge = "";
    if (konfirmasi === "Akan Hadir") {
      statusBadge = `<span class=\"card-status badge-hadir\">Akan Hadir</span>`;
    } else if (konfirmasi === "Tidak Dapat Hadir") {
      statusBadge = `<span class=\"card-status badge-tidak-hadir\">Tidak Dapat Hadir</span>`;
    }
    const newWishHTML = `
            <div class=\"wish-card\" id=\"wish-${id}\">
                <div class=\"card-name\">${nama} ${statusBadge}</div>
                <p class=\"card-text\">\"${ucapan}\"</p>
            </div>`;
    wishWall.insertAdjacentHTML("afterbegin", newWishHTML);
  }

  function updateMusicControllerVisuals() {
    if (!musicController || !musicIcon) return;
    if (isMusicPlaying) {
      musicController.classList.add("playing");
      musicIcon.className = "bi bi-pause-circle-fill";
    } else {
      musicController.classList.remove("playing");
      musicIcon.className = "bi bi-play-circle-fill";
    }
  }

  // --- BAGIAN 3: INISIALISASI & LOGIKA UTAMA ---
  // Logika untuk membuka sampul (cover)
  if (openButton) {
    openButton.addEventListener("click", () => {
      // 1. Mainkan musik & update ikon
      if (music) {
        music.play().catch((e) => console.error("Gagal memutar musik:", e));
        isMusicPlaying = true;
        updateMusicControllerVisuals();
      }

      // 2. Animasi fade out untuk cover
      cover.style.transition = "opacity 1s ease-out, transform 1s ease-out";
      cover.style.opacity = "0";
      cover.style.transform = "scale(1.2)";

      // 3. Setelah animasi selesai, tampilkan konten utama
      setTimeout(() => {
        cover.classList.add("d-none");
        if (content) content.classList.remove("d-none");

        // 4. Tambahkan class ke body untuk padding navbar
        document.body.classList.add("content-visible");

        // 5. Tampilkan music controller & footer
        if (musicController) musicController.style.display = "flex";
        if (footer) footer.style.display = "block";

        // 6. Jalankan animasi GSAP
        setupGsapAnimations();

        // 7. Animasi Dekor Pojok Bawah Masuk (fade-in halus dari bawah)
        gsap.from(".corner-dekor.bottom-left", {
          y: 60, opacity: 0,
          duration: 1.5, ease: "power2.out"
        });
        gsap.from(".corner-dekor.bottom-right", {
          y: 60, opacity: 0,
          duration: 1.5, ease: "power2.out"
        });

        // 8. Animasi Pohon Tumbuh dari Belakang - tree1.png dulu, lalu tree.png di atasnya
        gsap.fromTo(".tree-bottom", {
          scaleY: 0,
          opacity: 0,
          transformOrigin: "bottom center"
        }, {
          scaleY: 1,
          opacity: 1,
          duration: 2,
          ease: "power2.out"
        });

        gsap.fromTo(".tree-top", {
          scaleY: 0,
          opacity: 0,
          transformOrigin: "bottom center"
        }, {
          scaleY: 1,
          opacity: 1,
          duration: 2,
          ease: "power2.out",
          delay: 1
        });
      }, 1500); // Samakan dengan durasi transisi
    });
  }

  // Logika untuk tombol kontroler musik
  if (musicController) {
    musicController.addEventListener("click", () => {
      if (isMusicPlaying) {
        music.pause();
      } else {
        music.play();
      }
      isMusicPlaying = !isMusicPlaying;
      updateMusicControllerVisuals();
    });
  }

  // Logika auto-pause/play saat pindah tab
  document.addEventListener("visibilitychange", () => {
    if (!music) return;
    if (document.visibilityState === "hidden") {
      music.pause();
    } else if (document.visibilityState === "visible" && isMusicPlaying) {
      music.play();
    }
  });

  // Memuat ucapan awal dari Supabase
  if (wishWall) {
    if (!rsvpSupabase) {
      if (loadingWishes) loadingWishes.style.display = "none";
      console.error("Supabase belum diinisialisasi.");
      return;
    }
    rsvpSupabase
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (loadingWishes) loadingWishes.style.display = "none";
        if (error) {
          if (loadingWishes) loadingWishes.textContent = "Gagal memuat ucapan.";
          console.error("Error loading wishes!", error);
          return;
        }
        (data || []).forEach((wish) => {
          addWishToWall(
            wish.nama,
            wish.ucapan,
            wish.konfirmasi,
            wish.id
          );
        });
      })
      .catch((error) => {
        if (loadingWishes) loadingWishes.textContent = "Gagal memuat ucapan.";
        console.error("Error loading wishes!", error);
      });
  }

  // Logika untuk tombol Salin (Copy)
  copyButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const textToCopy = e.currentTarget.dataset.copy;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          const originalText = e.currentTarget.innerHTML;
          e.currentTarget.innerHTML = "Berhasil Disalin!";
          e.currentTarget.disabled = true;
          setTimeout(() => {
            e.currentTarget.innerHTML = originalText;
            e.currentTarget.disabled = false;
          }, 2000);
        })
        .catch((err) => {
          console.error("Gagal menyalin: ", err);
        });
    });
  });

  // Logika untuk form RSVP
  if (form) {
    konfirmasiSelect.addEventListener("change", function () {
      if (jumlahTamuWrapper)
        jumlahTamuWrapper.style.display =
          this.value === "Akan Hadir" ? "block" : "none";
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      buttonText.classList.add("d-none");
      buttonSpinner.classList.remove("d-none");
      submitButton.disabled = true;
      const formData = new FormData(form);
      const nama = formData.get("Nama");
      const ucapan = formData.get("Ucapan");
      const konfirmasi = formData.get("Konfirmasi");
      if (!rsvpSupabase) {
        console.error("Supabase belum diinisialisasi.");
        buttonText.classList.remove("d-none");
        buttonSpinner.classList.add("d-none");
        submitButton.disabled = false;
        return;
      }
      // Optimistic UI: tambahkan ucapan ke wish wall segera tanpa menunggu server
      const tempId = "temp-" + Date.now();
      addWishToWall(nama, ucapan, konfirmasi, tempId);
      if (rsvpModal) rsvpModal.hide();
      form.reset();
      if (jumlahTamuWrapper) jumlahTamuWrapper.style.display = "none";

      rsvpSupabase
        .from("rsvps")
        .insert([{ nama, ucapan, konfirmasi, jumlah: formData.get("Jumlah") || "" }])
        .then(({ data, error }) => {
          if (error) {
            console.error("Error!", error.message);
            // Hapus ucapan temp jika insert gagal (opsional)
            const tempCard = document.getElementById(`wish-${tempId}`);
            if (tempCard) tempCard.remove();
            return;
          }
          // Jika Supabase mengembalikan id asli, ganti ID temp dengan id asli
          const inserted = data?.[0];
          if (inserted && inserted.id) {
            const tempCard = document.getElementById(`wish-${tempId}`);
            if (tempCard) tempCard.id = `wish-${inserted.id}`;
          }
        })
        .catch((error) => {
          console.error("Error!", error.message);
          const tempCard = document.getElementById(`wish-${tempId}`);
          if (tempCard) tempCard.remove();
        })
        .finally(() => {
          buttonText.classList.remove("d-none");
          buttonSpinner.classList.add("d-none");
          submitButton.disabled = false;
        });
    });
  }

  // Logika untuk countdown timer
  if (countdownContainer) {
    // Format: "Mmm DD, YYYY HH:MM:SS"
    const weddingDate = new Date("Dec 13, 2026 10:00:00").getTime();
    const countdownFunction = setInterval(function () {
      const now = new Date().getTime();
      const distance = weddingDate - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const daysEl = document.getElementById("days");
      const hoursEl = document.getElementById("hours");
      const minutesEl = document.getElementById("minutes");
      const secondsEl = document.getElementById("seconds");
      if (daysEl) daysEl.innerHTML = String(days).padStart(2, "0");
      if (hoursEl) hoursEl.innerHTML = String(hours).padStart(2, "0");
      if (minutesEl) minutesEl.innerHTML = String(minutes).padStart(2, "0");
      if (secondsEl) secondsEl.innerHTML = String(seconds).padStart(2, "0");
      if (distance < 0) {
        clearInterval(countdownFunction);
        countdownContainer.classList.add("d-none");
        if (countdownExpired) countdownExpired.classList.remove("d-none");
      }
    }, 1000);
  }

  // --- BAGIAN 4: LOGIKA UNTUK NAVBAR ACTIVE LINK HIGHLIGHTING ---
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar .nav-link");

  if (sections.length > 0 && navLinks.length > 0) {
    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) {
            const sectionId = section.getAttribute("id");
            navLinks.forEach((link) => {
              link.classList.remove("active");
              if (link.getAttribute("href") === `#${sectionId}`)
                link.classList.add("active");
            });
          }
        },
      });
    });
  }

  // --- BAGIAN 5: ANIMASI GSAP & SCROLLTRIGGER ---
  // Gaya: SMOOTH & ELEGAN — fade + blur reveal halus, drift vertikal pendek,
  // ease "power2.out" / "expo.out". Tidak ada bounce, tidak ada rotasi ekstrem,
  // sesuai nuansa tradisional minimalis.
  function setupGsapAnimations() {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Default ease & start untuk semua tween (konsisten di seluruh halaman)
    const EASE = "power2.out";
    const START = "top 88%";

    // Smooth scroll navbar — durasi lebih pendek supaya tidak terasa "molor"
    document.querySelectorAll('.navbar a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        gsap.to(window, {
          duration: 1.4,
          scrollTo: { y: this.getAttribute("href"), offsetY: 50 },
          ease: "power2.inOut",
        });
      });
    });

    // Helper: reveal teks per-kata (bukan per-char — lebih kalem untuk heading)
    function revealText(selector, trigger) {
      const element = document.querySelector(selector);
      if (!element) return;
      const split = new SplitType(element, { types: "words" });
      gsap.from(split.words, {
        opacity: 0,
        y: 14,
        filter: "blur(8px)",
        duration: 1.1,
        stagger: 0.06,
        ease: EASE,
        scrollTrigger: {
          trigger: trigger || selector,
          start: START,
          toggleActions: "play none none none",
        },
      });
    }

    // Helper: reveal teks per-kata dengan efek bounce (untuk judul card)
    function revealTextBounce(selector, trigger) {
      const element = document.querySelector(selector);
      if (!element) return;
      const split = new SplitType(element, { types: "words" });
      gsap.from(split.words, {
        opacity: 0,
        y: 40,
        filter: "blur(4px)",
        duration: 1.2,
        delay: 0.6,           // Animasi mulai lebih lambat setelah terpicu
        stagger: 0.12,        // Kata muncul lebih lambat satu per satu
        ease: "elastic.out(1, 0.5)",
        scrollTrigger: {
          trigger: trigger || selector,
          start: START,
          toggleActions: "play none none none",
        },
      });
    }

    // Helper: fade-up halus untuk elemen umum
    function fadeUp(selector, options = {}) {
      gsap.from(selector, {
        opacity: 0,
        y: options.y ?? 24,
        filter: options.blur === false ? "none" : "blur(6px)",
        duration: options.duration ?? 1.0,
        ease: options.ease ?? EASE,
        stagger: options.stagger ?? 0,
        delay: options.delay ?? 0,
        scrollTrigger: {
          trigger: options.trigger || selector,
          start: options.start || START,
          toggleActions: "play none none none",
        },
      });
    }

    // 1. Section #quote — animasi lebih menarik: pop-up + rotasi halus + stagger dinamis
    const quoteCard = document.querySelector("#quote .card-section");
    if (quoteCard) {
      const quoteTl = gsap.timeline({
        scrollTrigger: { trigger: quoteCard, start: START, toggleActions: "play none none none" },
      });
      quoteTl
        // Card muncul dengan efek pop dramatis (scale 0.5 → 1) + rotasi + blur tebal
        .from(quoteCard, {
          opacity: 0,
          scale: 0.5,
          rotation: -5,
          filter: "blur(12px)",
          duration: 1.6,
          ease: "back.out(1.8)"
        })
        .add(() => quoteCard.classList.add("is-visible"))
        // Setelah reveal selesai, aktifkan efek melayang terus-menerus
        .add(() => quoteCard.classList.add("quote-float"))
        // Ikon kutipan: scale dramatis dari 0 + rotasi 20deg + bounce
        .from("#quote .bi-quote", {
          opacity: 0,
          scale: 0,
          rotation: 20,
          duration: 1.2,
          ease: "back.out(2)"
        }, "-=1.2")
        // Judul & tanggal: turun dari atas dengan rotasi bergantian
        .from("#quote h1, #quote .tgl", {
          opacity: 0,
          y: 30,
          rotation: -4,
          duration: 1,
          ease: "power3.out",
          stagger: 0.15
        }, "-=0.9")
        // Ayat Al-Quran: muncul perlahan dari bawah
        .from("#quote blockquote", {
          opacity: 0,
          y: 35,
          duration: 1.2,
          ease: "power3.out"
        }, "-=0.7");
    }

    // 2. Section #mempelai — judul dengan animasi bounce
    revealTextBounce("#mempelai h2", "#mempelai");
    fadeUp("#mempelai .container p", { trigger: "#mempelai", start: "top 82%" });

    // Foto & teks mempelai: fade-up anggun dan lembut tanpa glitch horizontal di HP
    fadeUp(".mempelai-pria", { trigger: ".mempelai-pria", start: "top 85%", y: 30, duration: 1.1 });
    fadeUp(".mempelai-wanita", { trigger: ".mempelai-wanita", start: "top 85%", y: 30, duration: 1.1 });
    gsap.from(".couple-ampersand, .couple-ampersand-badge", {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: { trigger: ".mempelai-pria", start: "top 82%" },
    });

    // 2b. Section #story (Love Story) — card muncul dengan efek flip 3D dramatis
    const storyCard = document.querySelector("#story .card-section");
    if (storyCard) {
      gsap.from(storyCard, {
        opacity: 0,
        rotationX: 20,
        scale: 0.85,
        filter: "blur(8px)",
        duration: 1.5,
        ease: "back.out(1.8)",
        scrollTrigger: {
          trigger: storyCard,
          start: "top 82%",
          toggleActions: "play none none none",
        },
      });
    }

    // 2b. Section #story — setiap kartu animasi saat baru masuk layar (bersamaan dengan posisi aslinya)
    gsap.from("#story .timeline-item:nth-child(1) .story-card", {
      opacity: 0,
      x: 80,        // mulai dari kanan layar
      filter: "blur(8px)",
      duration: 1.1,
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: "#story .timeline-item:nth-child(1) .story-card",
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });

    gsap.from("#story .timeline-item:nth-child(2) .story-card", {
      opacity: 0,
      x: -80,       // mulai dari kiri layar
      filter: "blur(8px)",
      duration: 1.1,
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: "#story .timeline-item:nth-child(2) .story-card",
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });

    gsap.from("#story .timeline-item:nth-child(3) .story-card", {
      opacity: 0,
      x: 80,        // mulai dari kanan layar
      filter: "blur(8px)",
      duration: 1.1,
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: "#story .timeline-item:nth-child(3) .story-card",
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });

    gsap.from("#story .timeline-item:nth-child(4) .story-card", {
      opacity: 0,
      x: -80,       // mulai dari kiri layar
      filter: "blur(8px)",
      duration: 1.1,
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: "#story .timeline-item:nth-child(4) .story-card",
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });

    // 2b. Section #story — timeline icon berputar dan membesar saat muncul
    gsap.from("#story .timeline-icon", {
      opacity: 0,
      scale: 0,
      rotation: 360,
      duration: 1,
      stagger: 0.4,
      ease: "back.out(2)",
      scrollTrigger: {
        trigger: "#story .timeline",
        start: "top 78%",
        toggleActions: "play none none none",
      },
    });

    // 2b. Section #story — badge tanggal muncul seperti stempel
    gsap.from("#story .story-badge", {
      opacity: 0,
      y: 15,
      scale: 0.6,
      rotation: -5,
      duration: 0.9,
      stagger: 0.25,
      ease: "elastic.out(1, 0.6)",
      scrollTrigger: {
        trigger: "#story .timeline",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    // 2b. Section #story — judul cerita muncul satu per satu dengan efek tulis
    gsap.from("#story .story-title", {
      opacity: 0,
      y: 20,
      duration: 0.9,
      stagger: 0.3,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#story .timeline",
        start: "top 82%",
        toggleActions: "play none none none",
      },
    });

    // 2b. Section #story — deskripsi muncul dengan blur halus
    gsap.from("#story .story-desc", {
      opacity: 0,
      y: 25,
      filter: "blur(6px)",
      duration: 1.1,
      stagger: 0.35,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#story .timeline",
        start: "top 84%",
        toggleActions: "play none none none",
      },
    });

    // 2b. Section #story — gambar muncul dengan efek zoom-in pelan
    gsap.from("#story .story-img", {
      opacity: 0,
      scale: 0.7,
      rotation: -5,
      duration: 1.2,
      stagger: 0.5,
      ease: "back.out(1.6)",
      scrollTrigger: {
        trigger: "#story .timeline",
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    // 2b. Section #story (Love Story) — judul section dengan animasi bounce
    revealTextBounce("#story h2", "#story");
    fadeUp("#story .lead", { trigger: "#story", start: "top 80%" });

    // 3. Section #acara — judul dengan animasi bounce
    revealTextBounce("#acara h2", "#acara");
    fadeUp("#acara .lead", { trigger: "#acara", start: "top 80%" });
    gsap.from("#acara .card", {
      opacity: 0, y: 40, filter: "blur(6px)", duration: 1.3, ease: "expo.out",
      scrollTrigger: { trigger: "#acara .card", start: "top 85%" },
    });

    // 4. Section #countdown — judul dengan animasi bounce
    revealTextBounce("#countdown h2", "#countdown");
    gsap.from(".timer-box", {
      opacity: 0, y: 30, filter: "blur(4px)", duration: 0.9,
      stagger: 0.12, // dari kiri ke kanan, lebih natural untuk countdown
      ease: EASE,
      scrollTrigger: { trigger: ".timer-box", start: "top 92%" },
    });

    // 5. Section #rsvp — judul dengan animasi bounce
    revealTextBounce("#rsvp h2", "#rsvp");
    fadeUp("#rsvp .lead", { trigger: "#rsvp", start: "top 80%" });
    fadeUp("#rsvp .btn-jawa", { trigger: "#rsvp .btn-jawa", start: "top 88%", y: 18 });
    fadeUp("#wish-wall", { trigger: "#wish-wall", start: "top 88%", y: 40 });

    // 6. Section #gift — judul dengan animasi bounce
    revealTextBounce("#gift h2", "#gift");
    fadeUp("#gift .lead", { trigger: "#gift", start: "top 80%" });
    gsap.from("#gift .gift-card", {
      opacity: 0, y: 30, filter: "blur(6px)", duration: 1.1, stagger: 0.18, ease: EASE,
      scrollTrigger: { trigger: "#gift .gift-card", start: "top 88%", toggleActions: "play none none none" },
    });

    // 7. Section #closing — judul dengan animasi bounce
    revealTextBounce("#closing h2", "#closing h2");
    fadeUp("#closing .lead", { trigger: "#closing .lead", start: "top 92%" });
    fadeUp("#closing .mt-5", { trigger: "#closing .mt-5", start: "top 92%", y: 24 });
    // Garis pemisah: lebar dari 0 ke penuh, lebih elegan daripada scale dari 0
    gsap.from("#closing hr", {
      scaleX: 0, transformOrigin: "center", opacity: 0, duration: 1.4, ease: "expo.out",
      scrollTrigger: { trigger: "#closing hr", start: "top 92%" },
    });
    fadeUp("#closing .col-md-5", {
      trigger: "#closing .col-md-5", start: "top 95%", stagger: 0.2,
    });
  }
  // --- LOGIKA UNTUK SIMPAN KE KALENDER (VERSI DROPDOWN) ---
  const googleCalendarLink = document.getElementById('google-calendar-link');
  const icsDownloadLink = document.getElementById('ics-download-link');

  // --- Detail Acara (didefinisikan sekali) ---
  // CATATAN: WIB = UTC+7. Untuk konversi: <jam WIB> dikurangi 7 jam = UTC.
  const eventDetails = {
      name: "Pernikahan Bagus & Ayu",
      details: "Acara Akad Nikah & Walimatul Ursy Raden Bagus Pratama, S.T. & Ayu Permata Sari, S.E. Kehadiran Anda adalah kebahagiaan bagi kami.",
      location: "Pendopo Among Tani, Jl. Kaliurang KM 9, Sleman, Daerah Istimewa Yogyakarta",

      // Waktu dalam format untuk Google Calendar (UTC/Zulu Time)
      startUTC: '20261011T020000Z', // 09:00 WIB
      endUTC:   '20261011T070000Z', // 14:00 WIB

      // Waktu dalam format untuk file ICS (dengan Timezone)
      startTimezone: '20261011T090000',
      endTimezone:   '20261011T140000',
      timezone: 'Asia/Jakarta'
  };

  // 1. Logika untuk Google Calendar
  if (googleCalendarLink) {
    googleCalendarLink.addEventListener('click', function(event) {
      event.preventDefault();

      const googleUrl = new URL('https://www.google.com/calendar/render');
      googleUrl.searchParams.append('action', 'TEMPLATE');
      googleUrl.searchParams.append('text', eventDetails.name);
      googleUrl.searchParams.append('dates', `${eventDetails.startUTC}/${eventDetails.endUTC}`);
      googleUrl.searchParams.append('details', eventDetails.details);
      googleUrl.searchParams.append('location', eventDetails.location);

      window.open(googleUrl.toString(), '_blank');
    });
  }

  // 2. Logika untuk unduh file .ics
  if (icsDownloadLink) {
    icsDownloadLink.addEventListener('click', function(event) {
      event.preventDefault();

      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        "SUMMARY:" + eventDetails.name,
        "DTSTART;TZID=" + eventDetails.timezone + ":" + eventDetails.startTimezone,
        "DTEND;TZID=" + eventDetails.timezone + ":" + eventDetails.endTimezone,
        "LOCATION:" + eventDetails.location,
        "DESCRIPTION:" + eventDetails.details,
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'pernikahan-bagus-ayu.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}); // --- AKHIR DARI DOMContentLoaded ---
