const isCapacitor =
  window.Capacitor !== undefined;

let LocalNotifications = null;

async function initCapacitor() {
  if (!isCapacitor) return;

  LocalNotifications =
    window.Capacitor?.Plugins?.LocalNotifications;
}

async function loadData() {
  initCapacitor();

  const res =
    await fetch("jadwal.json");

  const data =
    await res.json();

  const now =
    new Date();

  const hari = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu"
  ];

  document.getElementById(
    "tanggal"
  ).innerText =
    `${hari[now.getDay()]}, ${now.getDate()} ${getNamaBulan(now.getMonth())} ${now.getFullYear()}`;

  jadwalHariIni =
    data.jadwal.find(
      j => j.tanggal === now.getDate()
    );

  if (!jadwalHariIni) {
    document.getElementById(
      "ot"
    ).innerText = "-";

    document.getElementById(
      "masuk"
    ).innerText = "-";

    document.getElementById(
      "pulang"
    ).innerText = "-";

    document.getElementById(
      "notif"
    ).innerText = "-";

    document.getElementById(
      "countdown"
    ).innerText =
      "--:--:--";

    return;
  }

  const ot =
    jadwalHariIni.ot;

  document.getElementById(
    "ot"
  ).innerText =
    `${ot} Jam`;

  let jamMasuk = "-";
  let jamPulang = "-";

  if (ot === 1.5 || ot === 2) {
    jamMasuk = "08:00";
    jamPulang = "18:15";
  }

  if (ot === 2.5 || ot === 8) {
    jamMasuk = "07:00";
    jamPulang = "18:15";
  }

  if (ot === 0) {
    document.getElementById(
      "masuk"
    ).innerText = "-";

    document.getElementById(
      "pulang"
    ).innerText = "-";
  } else {
    document.getElementById(
      "masuk"
    ).innerText = jamMasuk;

    document.getElementById(
      "pulang"
    ).innerText = jamPulang;
  }

  startCountdown(data);

  if (isCapacitor) {
    await requestNotifPermission();
    await scheduleTodayNotifications(
      data
    );
  }
}

function getNamaBulan(
  bulan
) {
  const nama = [
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

  return nama[bulan];
}

function getNotifMasuk(
  ot
) {
  if (ot === 1.5 || ot === 2) {
    return "07:30";
  }

  if (ot === 2.5 || ot === 8) {
    return "05:30";
  }

  return null;
}

function getLabelHari(
  jumlahHari
) {
  if (jumlahHari === 0)
    return "";

  if (jumlahHari === 1)
    return " (Besok)";

  return ` (${jumlahHari} hari lagi)`;
}

function startCountdown(
  data
) {
  setInterval(() => {
    const now =
      new Date();

    let target =
      null;

    let textNotif =
      "";

    let pesanNotif =
      "";

    for (
      let i = 0;
      i < 31;
      i++
    ) {
      const cekTanggal =
        new Date(now);

      cekTanggal.setDate(
        now.getDate() + i
      );

      const tanggal =
        cekTanggal.getDate();

      const dataHari =
        data.jadwal.find(
          j =>
            j.tanggal ===
            tanggal
        );

      if (!dataHari)
        continue;

      if (
        dataHari.ot === 0
      )
        continue;

      const notifMasuk =
        getNotifMasuk(
          dataHari.ot
        );

      const notifPulang =
        "17:45";

      const reminderList =
        [
          {
            jam:
              notifMasuk,
            pesan:
              "🌞 Jangan lupa absen masuk."
          },
          {
            jam:
              notifPulang,
            pesan:
              "🌆 Jangan lupa absen pulang."
          }
        ];

      for (const reminder of reminderList) {
        const [h, m] =
          reminder.jam.split(
            ":"
          );

        const waktu =
          new Date(
            cekTanggal
          );

        waktu.setHours(
          Number(h),
          Number(m),
          0,
          0
        );

        if (
          waktu > now
        ) {
          target =
            waktu;

          textNotif =
            reminder.jam +
            " WIB" +
            getLabelHari(
              i
            );

          pesanNotif =
            reminder.pesan;

          break;
        }
      }

      if (target)
        break;
    }

    if (!target) {
      document.getElementById(
        "notif"
      ).innerText =
        "-";

      document.getElementById(
        "pesanNotif"
      ).innerText =
        "Tidak ada reminder.";

      document.getElementById(
        "countdown"
      ).innerText =
        "--:--:--";

      return;
    }

    const diff =
      target - now;

    const jam =
      Math.floor(
        diff /
          3600000
      );

    const menit =
      Math.floor(
        (diff %
          3600000) /
          60000
      );

    const detik =
      Math.floor(
        (diff %
          60000) /
          1000
      );

    document.getElementById(
      "countdown"
    ).innerText =
      `${jam
        .toString()
        .padStart(
          2,
          "0"
        )}:${menit
        .toString()
        .padStart(
          2,
          "0"
        )}:${detik
        .toString()
        .padStart(
          2,
          "0"
        )}`;

    document.getElementById(
      "notif"
    ).innerText =
      textNotif;

    document.getElementById(
      "pesanNotif"
    ).innerText =
      pesanNotif;
  }, 1000);
}

async function requestNotifPermission() {
  if (!isCapacitor)
    return;

  await LocalNotifications.requestPermissions();
}

async function scheduleNotification(
  id,
  title,
  body,
  date
) {
  if (!isCapacitor)
    return;

  await LocalNotifications.schedule({
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
}

async function scheduleTodayNotifications(
  data
) {
  if (!isCapacitor)
    return;

  await LocalNotifications.cancel({
    notifications: [
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 999
      }
    ]
  });

  const now =
    new Date();

  const jadwal =
    data.jadwal.find(
      j =>
        j.tanggal ===
        now.getDate()
    );

  if (!jadwal)
    return;

  if (jadwal.ot === 0)
    return;

  const notifMasuk =
    getNotifMasuk(
      jadwal.ot
    );

  const [h, m] =
    notifMasuk.split(
      ":"
    );

  const masuk =
    new Date();

  masuk.setHours(
    Number(h),
    Number(m),
    0,
    0
  );

  if (masuk > now) {
    await scheduleNotification(
      1,
      "Pengingat Absen",
      "🌞 Jangan lupa absen masuk.",
      masuk
    );
  }

  const pulang =
    new Date();

  pulang.setHours(
    17,
    45,
    0,
    0
  );

  if (pulang > now) {
    await scheduleNotification(
      2,
      "Pengingat Absen",
      "🌆 Jangan lupa absen pulang.",
      pulang
    );
  }
}

document
  .getElementById(
    "testNotifBtn"
  )
  ?.addEventListener(
    "click",
    async () => {
      if (
        !isCapacitor
      ) {
        alert(
          "Mode Browser.\nNotifikasi Android hanya bekerja di APK."
        );
        return;
      }

      await requestNotifPermission();

      const date =
        new Date(
          Date.now() +
            5000
        );

      await scheduleNotification(
        999,
        "Tes Notifikasi",
        "🎉 Notifikasi berhasil bekerja!",
        date
      );

      alert(
        "Notifikasi akan muncul dalam 5 detik."
      );
    }
  );

loadData();