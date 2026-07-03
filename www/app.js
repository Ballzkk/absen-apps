// =========================
// APP ABSEN
// PART 1
// KONSTANTA + STORAGE + UTILITY
// =========================

const STORAGE_JADWAL = "jadwalOT";
const STORAGE_PROFILE = "profile";

// =========================
// ELEMENT HTML
// =========================

const todayDate =
  document.getElementById(
    "todayDate"
  );

const todayOT =
  document.getElementById(
    "todayOT"
  );

const jamMasuk =
  document.getElementById(
    "jamMasuk"
  );

const jamPulang =
  document.getElementById(
    "jamPulang"
  );

const reminderText =
  document.getElementById(
    "reminderText"
  );

const countdown =
  document.getElementById(
    "countdown"
  );

const planningList =
  document.getElementById(
    "planningList"
  );

// =========================
// PROFILE
// =========================

const profileName =
  document.getElementById(
    "profileName"
  );

const profileNik =
  document.getElementById(
    "profileNik"
  );

const profileDept =
  document.getElementById(
    "profileDept"
  );

const profilePhone =
  document.getElementById(
    "profilePhone"
  );

const profilePhoto =
  document.getElementById(
    "profilePhoto"
  );

const profileUpload =
  document.getElementById(
    "profileUpload"
  );

const saveProfileBtn =
  document.getElementById(
    "saveProfile"
  );

const headerPhoto =
  document.getElementById(
    "headerPhoto"
  );

const headerName =
  document.getElementById(
    "headerName"
  );

const headerDept =
  document.getElementById(
    "headerDept"
  );

// =========================
// EDIT OT
// =========================

const editTanggal =
  document.getElementById(
    "editTanggal"
  );

const otPagi =
  document.getElementById(
    "otPagi"
  );

const otSore =
  document.getElementById(
    "otSore"
  );

const saveOT =
  document.getElementById(
    "saveOT"
  );

// =========================
// UPLOAD JSON
// =========================

const uploadJson =
  document.getElementById(
    "uploadJson"
  );

const importBtn =
  document.getElementById(
    "importBtn"
  );

// =========================
// NAMA HARI
// =========================

const hariNama = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu"
];

// =========================
// NAMA BULAN
// =========================

const bulanNama = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];

// =========================
// KEY BULAN
// =========================

function getMonthKey(
  bulan,
  tahun
) {
  return `${bulan}-${tahun}`;
}

// =========================
// AMBIL SEMUA DATA
// =========================

function getAllData() {
  return JSON.parse(
    localStorage.getItem(
      STORAGE_JADWAL
    ) || "{}"
  );
}

// =========================
// SIMPAN SEMUA DATA
// =========================

function saveAllData(
  data
) {
  localStorage.setItem(
    STORAGE_JADWAL,
    JSON.stringify(data)
  );
}

// =========================
// AMBIL DATA BULAN
// =========================

function getMonthData(
  bulan,
  tahun
) {
  const all =
    getAllData();

  const key =
    getMonthKey(
      bulan,
      tahun
    );

  return all[key];
}

// =========================
// DATA BULAN SEKARANG
// =========================

function getCurrentData() {
  const now =
    new Date();

  const bulan =
    now.getMonth() + 1;

  const tahun =
    now.getFullYear();

  return getMonthData(
    bulan,
    tahun
  );
}

// =========================
// SIMPAN DATA BULAN
// =========================

function saveMonthData(
  data
) {
  const all =
    getAllData();

  const key =
    getMonthKey(
      data.bulan,
      data.tahun
    );

  all[key] = data;

  saveAllData(all);
}

// =========================
// CEK WEEKEND
// =========================

function isWeekend(
  tanggal,
  bulan,
  tahun
) {
  const date =
    new Date(
      tahun,
      bulan - 1,
      tanggal
    );

  const hari =
    date.getDay();

  return (
    hari === 0 ||
    hari === 6
  );
}

// =========================
// GET NAMA HARI
// =========================

function getHari(
  tanggal,
  bulan,
  tahun
) {
  const date =
    new Date(
      tahun,
      bulan - 1,
      tanggal
    );

  return hariNama[
    date.getDay()
  ];
}

// =========================
// GET NAMA BULAN
// =========================

function getNamaBulan(
  bulan
) {
  return bulanNama[
    bulan - 1
  ];
}

// =========================
// FORMAT TANGGAL
// =========================

function formatTanggal(
  tanggal,
  bulan,
  tahun
) {
  const hari =
    getHari(
      tanggal,
      bulan,
      tahun
    );

  return `${hari}, ${tanggal} ${getNamaBulan(
    bulan
  )} ${tahun}`;
}

// =========================
// AMBIL OT HARI INI
// =========================

function getTodayOT() {
  const data =
    getCurrentData();

  if (!data)
    return null;

  const today =
    new Date()
      .getDate();

  return data.jadwal.find(
    x =>
      x.tanggal ===
      today
  );
}

// =========================
// KONVERSI OT
// =========================

function parseOT(ot) {
  if (ot === 0) {
    return {
      otPagi: 0,
      otSore: 0
    };
  }

  if (ot === 1.5) {
    return {
      otPagi: 0,
      otSore: 1.5
    };
  }

  if (ot === 2) {
    return {
      otPagi: 1,
      otSore: 1
    };
  }

  if (ot > 2) {
    return {
      otPagi: 1,
      otSore: ot - 1
    };
  }

  return {
    otPagi: 0,
    otSore: ot
  };
}

// =========================
// TOTAL OT
// =========================

function getTotalOT(
  pagi,
  sore
) {
  return (
    Number(pagi) +
    Number(sore)
  );
}

// =========================
// TAMBAH JAM
// =========================

function tambahJam(
  waktu,
  jamTambahan
) {
  let [jam, menit] =
    waktu
      .split(":")
      .map(Number);

  let total =
    jam * 60 +
    menit +
    jamTambahan * 60;

  let h =
    Math.floor(
      total / 60
    );

  let m =
    total % 60;

  return `${String(h).padStart(
    2,
    "0"
  )}:${String(m).padStart(
    2,
    "0"
  )}`;
}

// =========================
// KURANG MENIT
// =========================

function kurangMenit(
  waktu,
  menitKurang
) {
  let [jam, menit] =
    waktu
      .split(":")
      .map(Number);

  let total =
    jam * 60 +
    menit -
    menitKurang;

  if (total < 0) {
    total +=
      24 * 60;
  }

  const h =
    Math.floor(
      total / 60
    );

  const m =
    total % 60;

  return `${String(h).padStart(
    2,
    "0"
  )}:${String(m).padStart(
    2,
    "0"
  )}`;
}

// =========================
// JAM MASUK
// =========================

function getJamMasuk(
  otPagi
) {
  const jam =
    8 -
    Number(otPagi);

  return `${String(jam).padStart(
    2,
    "0"
  )}:00`;
}

// =========================
// JAM PULANG NORMAL
// =========================

function getPulangNormal(
  hari
) {
  return hari ===
    "Jumat"
    ? "17:00"
    : "16:45";
}

// =========================
// JAM PULANG
// =========================

function getJamPulang(
  hari,
  otSore
) {
  return tambahJam(
    getPulangNormal(
      hari
    ),
    otSore
  );
}

// =========================
// APP ABSEN
// PART 2
// DASHBOARD + STATUS HARI
// =========================

function loadToday() {
  const data =
    getCurrentData();

  const now =
    new Date();

  const tanggal =
    now.getDate();

  const bulan =
    now.getMonth() + 1;

  const tahun =
    now.getFullYear();

  const hari =
    getHari(
      tanggal,
      bulan,
      tahun
    );

  todayDate.innerText =
    formatTanggal(
      tanggal,
      bulan,
      tahun
    );

  // Belum ada data bulan
  if (!data) {
    todayOT.innerText =
      "-";

    jamMasuk.innerText =
      "-";

    jamPulang.innerText =
      "-";

    reminderText.innerText =
      "Belum ada jadwal bulan ini";

    countdown.innerText =
      "--:--:--";

    return;
  }

  const item =
    data.jadwal.find(
      x =>
        x.tanggal ===
        tanggal
    );

  // Tidak ada data OT
  if (!item) {

    if (
      isWeekend(
        tanggal,
        bulan,
        tahun
      )
    ) {
      todayOT.innerText =
        "Libur";

      reminderText.innerText =
        "Hari ini libur 🎉";
    } else {
      todayOT.innerText =
        "0 Jam";

      reminderText.innerText =
        "Tidak ada over time hari ini";
    }

    jamMasuk.innerText =
      "-";

    jamPulang.innerText =
      "-";

    countdown.innerText =
      "--:--:--";

    return;
  }

  // Ada data tapi OT = 0
  if (item.ot <= 0) {

    if (
      isWeekend(
        tanggal,
        bulan,
        tahun
      )
    ) {
      todayOT.innerText =
        "Libur";

      reminderText.innerText =
        "Hari ini libur 🎉";
    } else {
      todayOT.innerText =
        "0 Jam";

      reminderText.innerText =
        "Tidak ada over time hari ini";
    }

    jamMasuk.innerText =
      "-";

    jamPulang.innerText =
      "-";

    countdown.innerText =
      "--:--:--";

    return;
  }

  // Ada OT
  const ot =
    parseOT(
      item.ot
    );

  const masuk =
    getJamMasuk(
      ot.otPagi
    );

  const pulang =
    getJamPulang(
      hari,
      ot.otSore
    );

  todayOT.innerText =
    `${item.ot} Jam`;

  jamMasuk.innerText =
    masuk;

  jamPulang.innerText =
    pulang;
}

// =========================
// PLANNING LIST
// =========================

function renderPlanning() {
  const data =
    getCurrentData();

  planningList.innerHTML =
    "";

  if (!data) {
    planningList.innerHTML =
      `
      <div class="card">
        Belum ada jadwal bulan ini.
      </div>
      `;

    return;
  }

  data.jadwal.forEach(
    item => {

      const hari =
        getHari(
          item.tanggal,
          data.bulan,
          data.tahun
        );

      let status =
        `${item.ot} Jam`;

      if (
        item.ot <= 0
      ) {
        if (
          isWeekend(
            item.tanggal,
            data.bulan,
            data.tahun
          )
        ) {
          status =
            "Libur";
        } else {
          status =
            "Tidak Ada OT";
        }
      }

      planningList.innerHTML += `
      <div class="planning-item">

        <div>

          <div class="planning-info">

  <div class="planning-date">
    ${hari},
    ${item.tanggal}
    ${getNamaBulan(
      data.bulan
    )}
  </div>

  <div class="planning-subtitle">
    ${
      status === "Libur"
        ? "Hari Libur"
        : status ===
          "Tidak Ada OT"
        ? "Tidak ada over time"
        : "Over Time"
    }
  </div>

</div>

        </div>

        <div
          class="planning-ot"
        >
          ${status}
        </div>

      </div>
      `;
    }
  );
}

// =========================
// AMBIL DATA OT BERDASARKAN TANGGAL
// =========================

function getOTByDate(
  tanggal,
  bulan,
  tahun
) {
  const data =
    getMonthData(
      bulan,
      tahun
    );

  if (!data)
    return null;

  return data.jadwal.find(
    x =>
      x.tanggal ===
      tanggal
  );
}

// =========================
// STATUS HARI
// =========================

function getStatusHari(
  tanggal,
  bulan,
  tahun
) {
  const item =
    getOTByDate(
      tanggal,
      bulan,
      tahun
    );

  if (
    item &&
    item.ot > 0
  ) {
    return "OT";
  }

  if (
    isWeekend(
      tanggal,
      bulan,
      tahun
    )
  ) {
    return "LIBUR";
  }

  return "NORMAL";
}

// =========================
// CEK OT AKTIF
// =========================

function hasOTToday() {
  const item =
    getTodayOT();

  if (!item)
    return false;

  return item.ot > 0;
}

// =========================
// PART 3
// UPLOAD JSON
// VALIDASI
// KALENDER
// =========================

const calendarView =
  document.getElementById(
    "calendarView"
  );

const calendarHeader =
  document.querySelector(
    ".calendar-header"
  );

const listMode =
  document.getElementById(
    "listMode"
  );

const calendarMode =
  document.getElementById(
    "calendarMode"
  );

// =========================
// VALIDASI JSON
// =========================

function validateJSON(
  data
) {
  if (
    !data ||
    !data.bulan ||
    !data.tahun ||
    !Array.isArray(
      data.jadwal
    )
  ) {
    return false;
  }

  for (
    const item of data.jadwal
  ) {
    if (
      typeof item.tanggal !==
        "number" ||
      typeof item.ot !==
        "number"
    ) {
      return false;
    }
  }

  return true;
}

// =========================
// IMPORT JSON
// =========================

function importJSON() {
  const file =
    uploadJson.files[0];

  if (!file) {
    alert(
      "Pilih file JSON."
    );

    return;
  }

  const reader =
    new FileReader();

  reader.onload =
    e => {

      try {
        const data =
          JSON.parse(
            e.target.result
          );

        if (
          !validateJSON(
            data
          )
        ) {
          alert(
            "Format JSON tidak valid."
          );

          return;
        }

        saveMonthData(
          data
        );

        alert(
          `Jadwal ${getNamaBulan(
            data.bulan
          )} ${data.tahun}
berhasil diimport.`
        );

        loadToday();
        renderPlanning();
        renderCalendar();

        if (
          isCapacitor
        ) {
          scheduleToday();
        }

      } catch (e) {
        alert(
          "JSON tidak valid."
        );
      }
    };

  reader.readAsText(
    file
  );
}

importBtn.onclick =
  importJSON;

// =========================
// JUMLAH HARI
// =========================

function getDaysInMonth(
  bulan,
  tahun
) {
  return new Date(
    tahun,
    bulan,
    0
  ).getDate();
}

// =========================
// RENDER KALENDER
// =========================

function renderCalendar() {
  const data =
    getCurrentData();

  calendarView.innerHTML =
    "";

  if (!data)
    return;

  const days =
    getDaysInMonth(
      data.bulan,
      data.tahun
    );

  let html =
    `<div class="calendar-grid">`;

  const firstDay =
    new Date(
      data.tahun,
      data.bulan - 1,
      1
    ).getDay();

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {
    html += `
      <div class="calendar-empty">
      </div>
    `;
  }

  for (
    let i = 1;
    i <= days;
    i++
  ) {
    const item =
      data.jadwal.find(
        x =>
          x.tanggal === i
      );

    let badge = "";

    if (
      item &&
      item.ot > 0
    ) {
      badge =
        `${item.ot}`;
    }

    else if (
      isWeekend(
        i,
        data.bulan,
        data.tahun
      )
    ) {
      badge =
        "L";
    }

    const now =
      new Date();

    const isToday =
      i ===
        now.getDate() &&
      data.bulan ===
        now.getMonth() +
          1 &&
      data.tahun ===
        now.getFullYear();

    let className =
      "calendar-day";

    if (
      item &&
      item.ot > 0
    ) {
      className +=
        " ot";
    }

    if (
      !item &&
      isWeekend(
        i,
        data.bulan,
        data.tahun
      )
    ) {
      className +=
        " libur";
    }

    if (isToday) {
      className +=
        " today";
    }

    html += `
    <div
      class="${className}"
    >
      <div
        class="calendar-day-number"
      >
        ${i}
      </div>

      ${
        badge
          ? `
          <div
            class="calendar-day-badge"
          >
            ${badge}
          </div>
          `
          : ""
      }
    </div>
    `;
  }

  html +=
    "</div>";

  calendarView.innerHTML =
    html;
}

// =========================
// MODE LIST
// =========================

listMode.onclick =
  () => {

    planningList.style.display =
      "flex";

    calendarView.style.display =
      "none";

    if (
      calendarHeader
    ) {
      calendarHeader.style.display =
        "none";
    }

    listMode.classList.add(
      "active"
    );

    calendarMode.classList.remove(
      "active"
    );
  };

// =========================
// MODE KALENDER
// =========================

calendarMode.onclick =
  () => {

    planningList.style.display =
      "none";

    calendarView.style.display =
      "block";

    if (
      calendarHeader
    ) {
      calendarHeader.style.display =
        "grid";
    }

    calendarMode.classList.add(
      "active"
    );

    listMode.classList.remove(
      "active"
    );

    renderCalendar();
  };
  
  // =========================
// PART 4
// EDIT OT
// =========================

// Mengisi tanggal hari ini
function loadEditForm() {
  const now = new Date();

  const tahun =
    now.getFullYear();

  const bulan = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const tanggal = String(
    now.getDate()
  ).padStart(2, "0");

  editTanggal.value =
    `${tahun}-${bulan}-${tanggal}`;

  editTanggal.dispatchEvent(
    new Event("change")
  );
}

// Mengubah total OT menjadi
// OT Pagi dan OT Sore
function getOTForm(totalOT) {
  return parseOT(
    Number(totalOT)
  );
}

// Ketika tanggal diganti
editTanggal.onchange =
  () => {

    if (
      !editTanggal.value
    ) {
      otPagi.value = 0;
      otSore.value = 0;
      return;
    }

    const date =
      new Date(
        editTanggal.value
      );

    const tanggal =
      date.getDate();

    const bulan =
      date.getMonth() + 1;

    const tahun =
      date.getFullYear();

    const item =
      getOTByDate(
        tanggal,
        bulan,
        tahun
      );

    if (!item) {
      otPagi.value = 0;
      otSore.value = 0;
      return;
    }

    const ot =
      getOTForm(
        item.ot
      );

    otPagi.value =
      ot.otPagi;

    otSore.value =
      ot.otSore;
  };

// Simpan OT
function saveEditOT() {
  if (
    !editTanggal.value
  ) {
    alert(
      "Pilih tanggal terlebih dahulu."
    );

    return;
  }

  const date =
    new Date(
      editTanggal.value
    );

  const tanggal =
    date.getDate();

  const bulan =
    date.getMonth() + 1;

  const tahun =
    date.getFullYear();

  let data =
    getMonthData(
      bulan,
      tahun
    );

  // Jika bulan belum ada
  if (!data) {
    data = {
      bulan,
      tahun,
      jadwal: []
    };
  }

  const pagi =
    Number(
      otPagi.value
    ) || 0;

  const sore =
    Number(
      otSore.value
    ) || 0;

  const totalOT =
    getTotalOT(
      pagi,
      sore
    );

  const index =
    data.jadwal.findIndex(
      x =>
        x.tanggal ===
        tanggal
    );

  // Jika tanggal sudah ada
  if (index >= 0) {
    data.jadwal[
      index
    ].ot =
      totalOT;
  }

  // Jika belum ada
  else {
    data.jadwal.push({
      tanggal,
      ot: totalOT
    });
  }

  // Urutkan tanggal
  data.jadwal.sort(
    (a, b) =>
      a.tanggal -
      b.tanggal
  );

  saveMonthData(
    data
  );

  alert(
    "OT berhasil disimpan."
  );

  loadToday();
  renderPlanning();
  renderCalendar();

  if (
    typeof scheduleToday ===
      "function" &&
    isCapacitor
  ) {
    scheduleToday();
  }
}

// Hapus OT
function deleteOT(
  tanggal,
  bulan,
  tahun
) {
  const data =
    getMonthData(
      bulan,
      tahun
    );

  if (!data)
    return;

  data.jadwal =
    data.jadwal.filter(
      x =>
        x.tanggal !==
        tanggal
    );

  saveMonthData(
    data
  );

  loadToday();
  renderPlanning();
  renderCalendar();

  if (
    typeof scheduleToday ===
      "function" &&
    isCapacitor
  ) {
    scheduleToday();
  }
}

// Tombol simpan
saveOT.onclick =
  saveEditOT;

// Jalankan saat aplikasi dibuka
loadEditForm();


// =========================
// PART 5
// PROFILE + FOTO
// =========================

// Ambil profile dari localStorage
function getProfile() {
  return JSON.parse(
    localStorage.getItem(
      STORAGE_PROFILE
    ) || "{}"
  );
}

// Simpan profile
function saveProfileData(
  data
) {
  localStorage.setItem(
    STORAGE_PROFILE,
    JSON.stringify(data)
  );
}

// Load profile ke form
function loadProfile() {
  const profile =
    getProfile();

  profileName.value =
    profile.nama || "";

  profileNik.value =
    profile.nik || "";

  profileDept.value =
    profile.dept || "";

  profilePhone.value =
    profile.phone || "";

  // Foto profile
  if (profile.photo) {
    profilePhoto.src =
      profile.photo;

    headerPhoto.src =
      profile.photo;
  }

  // Nama di header
  headerName.innerText =
    profile.nama ||
    "App Absen";

  // Departemen di header
  headerDept.innerText =
    profile.dept ||
    "Selamat Datang";
}

// Simpan profile
function saveProfile() {
  const profile = {
    nama:
      profileName.value.trim(),

    nik:
      profileNik.value.trim(),

    dept:
      profileDept.value.trim(),

    phone:
      profilePhone.value.trim(),

    photo:
      profilePhoto.src
  };

  saveProfileData(
    profile
  );

  loadProfile();

  alert(
    "Profile berhasil disimpan."
  );
}

// Tombol simpan
saveProfileBtn.onclick =
  saveProfile;

// Upload foto
profileUpload.onchange =
  e => {

    const file =
      e.target.files[0];

    if (!file)
      return;

    // Validasi gambar
    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "File harus berupa gambar."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload =
      ev => {

        profilePhoto.src =
          ev.target.result;

        const profile =
          getProfile();

        profile.photo =
          ev.target.result;

        saveProfileData(
          profile
        );

        loadProfile();
      };

    reader.readAsDataURL(
      file
    );
  };

// Reset profile (opsional)
function resetProfile() {
  if (
    !confirm(
      "Hapus profile?"
    )
  ) {
    return;
  }

  localStorage.removeItem(
    STORAGE_PROFILE
  );

  profilePhoto.src =
    "assets/default-profile.png";

  headerPhoto.src =
    "assets/default-profile.png";

  profileName.value =
    "";

  profileNik.value =
    "";

  profileDept.value =
    "";

  profilePhone.value =
    "";

  headerName.innerText =
    "App Absen";

  headerDept.innerText =
    "Selamat Datang";
}

// Jalankan saat aplikasi dibuka
loadProfile();

// =========================
// PART 6
// NOTIFICATION + COUNTDOWN
// =========================

const isCapacitor =
  window.Capacitor !==
  undefined;

let LocalNotifications =
  null;

// Hari aktif sekarang
let currentDay =
  new Date().getDate();

// =========================
// INIT CAPACITOR
// =========================

function initCapacitor() {
  if (!isCapacitor)
    return;

  LocalNotifications =
    window.Capacitor
      ?.Plugins
      ?.LocalNotifications;
}

// =========================
// PERMISSION
// =========================

async function requestNotifPermission() {
  if (
    !LocalNotifications
  ) {
    return;
  }

  try {
    await LocalNotifications
      .requestPermissions();
  } catch (e) {
    console.log(e);
  }
}

// =========================
// SCHEDULE SATU NOTIF
// =========================

async function scheduleNotif(
  id,
  title,
  body,
  jam
) {
  if (
    !LocalNotifications
  ) {
    return;
  }

  const now =
    new Date();

  const [h, m] =
    jam
      .split(":")
      .map(Number);

  const date =
    new Date();

  date.setHours(
    h,
    m,
    0,
    0
  );

  // Jangan buat notif
  // yang waktunya sudah lewat
  if (date <= now)
    return;

  try {
    await LocalNotifications
      .schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: {
              at: date
            }
          }
        ]
      });
  } catch (e) {
    console.log(e);
  }
}

// =========================
// AMBIL REMINDER HARI INI
// =========================

function getReminderList() {
  const data =
    getCurrentData();

  if (!data)
    return [];

  const today =
    new Date()
      .getDate();

  const item =
    data.jadwal.find(
      x =>
        x.tanggal ===
        today
    );

  if (
    !item ||
    item.ot <= 0
  ) {
    return [];
  }

  const hari =
    getHari(
      today,
      data.bulan,
      data.tahun
    );

  const ot =
    parseOT(
      item.ot
    );

  const masuk =
    getJamMasuk(
      ot.otPagi
    );

  const pulang =
    getJamPulang(
      hari,
      ot.otSore
    );

  return [
    {
      text:
        "Absen Masuk",
      jam:
        kurangMenit(
          masuk,
          45
        )
    },
    {
      text:
        "Absen Masuk",
      jam:
        kurangMenit(
          masuk,
          30
        )
    },
    {
      text:
        "Absen Masuk",
      jam:
        kurangMenit(
          masuk,
          15
        )
    },
    {
      text:
        "Absen Pulang",
      jam:
        kurangMenit(
          pulang,
          45
        )
    },
    {
      text:
        "Absen Pulang",
      jam:
        kurangMenit(
          pulang,
          30
        )
    },
    {
      text:
        "Absen Pulang",
      jam:
        kurangMenit(
          pulang,
          15
        )
    }
  ];
}

// =========================
// JADWALKAN HARI INI
// =========================

async function scheduleToday() {
  if (
    !LocalNotifications
  ) {
    return;
  }

  const data =
    getCurrentData();

  if (!data)
    return;

  const reminderList =
    getReminderList();

  try {
    const pending =
      await LocalNotifications.getPending();

    await LocalNotifications.cancel({
      notifications:
        pending.notifications
    });
  } catch (e) {
    console.log(e);
  }

  if (
    reminderList.length ===
    0
  ) {
    return;
  }

  const today =
    new Date()
      .getDate();

  const item =
    data.jadwal.find(
      x =>
        x.tanggal ===
        today
    );

  const hari =
    getHari(
      today,
      data.bulan,
      data.tahun
    );

  const ot =
    parseOT(
      item.ot
    );

  const masuk =
    getJamMasuk(
      ot.otPagi
    );

  const pulang =
    getJamPulang(
      hari,
      ot.otSore
    );

  let id = 1;

  for (
    const item of reminderList
  ) {
    const body =
      item.text ===
      "Absen Masuk"
        ? `⏰ Absen masuk pukul ${masuk}`
        : `🏠 Absen pulang pukul ${pulang}`;

    await scheduleNotif(
      id++,
      item.text,
      body,
      item.jam
    );
  }
}

// =========================
// COUNTDOWN
// =========================

let countdownInterval =
  null;

function startCountdown() {
  if (
    countdownInterval
  ) {
    clearInterval(
      countdownInterval
    );
  }

  countdownInterval =
    setInterval(() => {

      const list =
        getReminderList();

      if (
        list.length ===
        0
      ) {
        countdown.innerText =
          "--:--:--";

        return;
      }

      const now =
        new Date();

      let target =
        null;

      let text =
        "";

      for (
        const item of list
      ) {
        const [h, m] =
          item.jam
            .split(":")
            .map(Number);

        const d =
          new Date();

        d.setHours(
          h,
          m,
          0,
          0
        );

        if (d > now) {
          target = d;
          text =
            item.text;
          break;
        }
      }

      if (!target) {
        reminderText.innerText =
          "Reminder selesai";

        countdown.innerText =
          "--:--:--";

        return;
      }

      reminderText.innerText =
        text;

      const diff =
        target - now;

      const jam =
        Math.floor(
          diff /
            3600000
        );

      const menit =
        Math.floor(
          diff %
            3600000 /
            60000
        );

      const detik =
        Math.floor(
          diff %
            60000 /
            1000
        );

      countdown.innerText =
        `${String(jam)
          .padStart(
            2,
            "0"
          )}:${String(menit)
          .padStart(
            2,
            "0"
          )}:${String(detik)
          .padStart(
            2,
            "0"
          )}`;
    }, 1000);
}

// =========================
// GANTI HARI OTOMATIS
// =========================

function watchDayChange() {
  setInterval(() => {

    const today =
      new Date()
        .getDate();

    if (
      today !==
      currentDay
    ) {
      currentDay =
        today;

      loadToday();

      renderPlanning();

      renderCalendar();

      startCountdown();

      if (
        isCapacitor
      ) {
        scheduleToday();
      }
    }
  }, 60000);
}

// =========================
// PART 7
// BOTTOM NAVIGATION
// =========================

const navButtons =
  document.querySelectorAll(
    ".nav-btn"
  );

const pages =
  document.querySelectorAll(
    ".page"
  );

// =========================
// BUKA PAGE
// =========================

function openPage(
  pageId
) {
  pages.forEach(page => {
    page.classList.remove(
      "active"
    );
  });

  navButtons.forEach(btn => {
    btn.classList.remove(
      "active"
    );
  });

  const page =
    document.getElementById(
      pageId
    );

  if (page) {
    page.classList.add(
      "active"
    );
  }

  const button =
    document.querySelector(
      `.nav-btn[data-page="${pageId}"]`
    );

  if (button) {
    button.classList.add(
      "active"
    );
  }
}

// =========================
// EVENT NAVIGATION
// =========================

navButtons.forEach(btn => {
  btn.onclick = () => {
    const pageId =
      btn.dataset.page;

    openPage(pageId);
  };
});


// =========================
// OVERRIDE OPEN PAGE
// =========================

const oldOpenPage =
  openPage;

openPage = function (
  pageId
) {
  pages.forEach(page => {
    page.classList.remove(
      "active"
    );
  });

  navButtons.forEach(btn => {
    btn.classList.remove(
      "active"
    );
  });

  const page =
    document.getElementById(
      pageId
    );

  if (page) {
    page.classList.add(
      "active"
    );
  }

  const button =
    document.querySelector(
      `.nav-btn[data-page="${pageId}"]`
    );

  if (button) {
    button.classList.add(
      "active"
    );
  }
};

// =========================
// REFRESH SAAT PINDAH PAGE
// =========================

function refreshCurrentPage() {
  const active =
    document.querySelector(
      ".page.active"
    );

  if (!active)
    return;

  switch (
    active.id
  ) {
    case "homePage":
      loadToday();
      break;

    case "planningPage":
      renderPlanning();
      break;

    case "profilePage":
      loadProfile();
      break;

    case "editPage":
      editTanggal.dispatchEvent(
        new Event(
          "change"
        )
      );
      break;
  }
}

// =========================
// REFRESH SETIAP PAGE DIBUKA
// =========================

navButtons.forEach(btn => {
  btn.addEventListener(
    "click",
    () => {
      setTimeout(() => {
        refreshCurrentPage();
      }, 100);
    }
  );
});

// =========================
// PART 8
// INIT APP
// =========================

function initApp() {

  // Load dashboard
  loadToday();

  // Load planning
  renderPlanning();

  // Load kalender
  renderCalendar();
  calendarMode.click();

  // Load profile
  loadProfile();

  // Load form edit
  loadEditForm();

  // Load halaman terakhir
  openPage("homePage");

  // Start countdown
  startCountdown();

  // Watch pergantian hari
  watchDayChange();

  // Inisialisasi Capacitor
  initCapacitor();

  // Notifikasi
  if (isCapacitor) {
    requestNotifPermission();
    scheduleToday();
  }

  console.log(
    "App Absen Ready 🚀"
  );
}

// =========================
// APP READY
// =========================

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initApp();
  }
);