/*
=========================================
 APP ABSEN V2
 Version : 2.2.0 (Full Upgraded + Notification Fix)
 Author  : Iqbal A & Gemini
=========================================
*/

/*=========================================
CONFIG
=========================================*/
const CONFIG = {
    APP: {
        NAME: "App Absen",
        VERSION: "2.2.0",
        DEBUG: true
    },
    STORAGE: {
        SCHEDULE_PREFIX: "jadwalOT_", // Basis penyimpanan multi-bulan (jadwalOT_YYYY_MM)
        PROFILE: "profile",
        SETTINGS: "settings"
    },
    WORKDAY: {
        SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
    },
    WORK: {
        START: "08:00",
        HOLIDAY_START: "07:00",
        NORMAL_END: "16:45",
        FRIDAY_END: "17:00",
        BREAK_START: "12:00",
        BREAK_DURATION: 45,
        MAX_OT: 24
    },
    OT: {
        MORNING: 1,
        MIN: 0,
        MAX: 24
    },
    REMINDER: {
        BEFORE: [45, 30, 15]
    },
    STATUS: {
        WORK: "Hari Kerja",
        WORK_OT: "Hari Kerja OT",
        HOLIDAY: "Hari Libur",
        HOLIDAY_OT: "OT Hari Libur"
    },
    PROFILE: {
        DEFAULT_NAME: "",
        DEFAULT_NIK: "",
        DEFAULT_DEPARTMENT: "",
        DEFAULT_PHONE: "",
        DEFAULT_PHOTO: "assets/default-profile.png"
    }
};

/*=========================================
ELEMENT UTILITY
=========================================*/
const $ = id => document.getElementById(id);
const EL = {
    headerPhoto: $("headerPhoto"),
    headerName: $("headerName"),
    headerDept: $("headerDept"),
    todayDate: $("todayDate"),
    todayInfo: $("todayInfo"),
    todayOT: $("todayOT"),
    jamMasuk: $("jamMasuk"),
    jamPulang: $("jamPulang"),
    reminderText: $("reminderText"),
    countdown: $("countdown"),
    planningList: $("planningList"),
    calendarView: $("calendarView"),
    calendarMode: $("calendarMode"),
    listMode: $("listMode"),
    editTanggal: $("editTanggal"),
    otPagi: $("otPagi"),
    otSore: $("otSore"),
    labelOtPagi: $("labelOtPagi"),   
    labelOtSore: $("labelOtSore"),   
    livePreviewBox: $("livePreviewBox"), 
    saveOT: $("saveOT"),
    uploadJson: $("uploadJson"),
    importBtn: $("importBtn"),
    exportBtn: $("exportBtn"),
    exportBulan: $("exportBulan"),   
    exportTahun: $("exportTahun"),   
    clearScheduleBtn: $("clearScheduleBtn"),
    profilePhoto: $("profilePhoto"),
    profileUpload: $("profileUpload"),
    profileName: $("profileName"),
    profileNik: $("profileNik"),
    profileDept: $("profileDept"),
    profilePhone: $("profilePhone"),
    saveProfile: $("saveProfile"),
    pages: document.querySelectorAll(".page"),
    navButtons: document.querySelectorAll(".nav-btn")
};

function debug(...message) {
    if (!CONFIG.DEBUG) return;
    console.log("[APP]", ...message);
}

/*=========================================
STORAGE LAYER
=========================================*/
const Storage = {
    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            debug(error);
            return null;
        }
    },
    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    remove(key) {
        localStorage.removeItem(key);
    },
    getScheduleKey(tahun, bulan) {
        return `${CONFIG.STORAGE.SCHEDULE_PREFIX}${tahun}_${String(bulan).padStart(2, "0")}`;
    }
};

/*=========================================
HELPER FUNCTIONS
=========================================*/
const Helper = {
    pad(number) {
        return String(number).padStart(2, "0");
    },
    getMonthName(month) {
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return months[month - 1] || "";
    },
    formatDateIndonesia(tanggal, bulan, tahun, dayName = "") {
        const date = `${tanggal} ${this.getMonthName(bulan)} ${tahun}`;
        return dayName ? `${dayName}, ${date}` : date;
    },
    toMinute(time) {
        if (!time || time === "-") return 0;
        const [h, m] = time.split(":").map(Number);
        return (h * 60) + m;
    },
    toTime(totalMinute) {
        totalMinute = ((totalMinute % 1440) + 1440) % 1440;
        return this.pad(Math.floor(totalMinute / 60)) + ":" + this.pad(totalMinute % 60);
    },
    addMinute(time, minute) {
        return this.toTime(this.toMinute(time) + minute);
    },
    subtractMinute(time, minute) {
        return this.toTime(this.toMinute(time) - minute);
    }
};

/*=========================================
VALIDATOR
=========================================*/
const Validator = {
    ot(value) {
        const n = Number(value);
        return !isNaN(n) && n >= 0 && n <= CONFIG.WORK.MAX_OT;
    },
    json(data) {
        return data && typeof data === "object" && data.bulan && data.tahun && Array.isArray(data.jadwal);
    }
};

/*=========================================
HOLIDAY & ENGINE
=========================================*/
const Holiday = {
    isWeekend(tanggal, bulan, tahun) {
        const day = new Date(tahun, bulan - 1, tanggal).getDay();
        return day === 0 || day === 6;
    },
    isHoliday(tanggal, bulan, tahun) {
        return this.isWeekend(tanggal, bulan, tahun);
    }
};

const Engine = {
    getDay(tanggal, bulan, tahun) {
        return new Date(tahun, bulan - 1, tanggal).getDay();
    },
    getDayName(tanggal, bulan, tahun) {
        const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        return dayNames[this.getDay(tanggal, bulan, tahun)];
    },
    getRule(tanggal, bulan, tahun) {
        const holiday = Holiday.isHoliday(tanggal, bulan, tahun);
        return {
            holiday,
            start: holiday ? CONFIG.WORK.HOLIDAY_START : CONFIG.WORK.START,
            end: (this.getDay(tanggal, bulan, tahun) === CONFIG.WORKDAY.FRIDAY) ? CONFIG.WORK.FRIDAY_END : CONFIG.WORK.NORMAL_END
        };
    },
    getWorkSchedule(tanggal, bulan, tahun, totalOT = 0, inputPagiOverride = null) {
        const rule = this.getRule(tanggal, bulan, tahun);
        
        if (rule.holiday && Number(totalOT) === 0) {
            return {
                tanggal, bulan, tahun,
                day: this.getDay(tanggal, bulan, tahun),
                dayName: this.getDayName(tanggal, bulan, tahun),
                holiday: true, working: false,
                status: CONFIG.STATUS.HOLIDAY,
                ot: { total: 0, pagi: 0, sore: 0, pagiMinute: 0, soreMinute: 0 },
                jamMasuk: "-", jamPulang: "-", reminder: []
            };
        }

        const otTotal = Math.max(CONFIG.OT.MIN, Math.min(CONFIG.OT.MAX, Number(totalOT) || 0));
        let pagi = 0, sore = otTotal;

        if (rule.holiday) {
            pagi = 0; 
            sore = otTotal;
        } else {
            if (inputPagiOverride !== null) {
                pagi = inputPagiOverride;
                sore = Math.max(0, otTotal - pagi);
            } else if (otTotal > 1.5) {
                pagi = CONFIG.OT.MORNING;
                sore = otTotal - CONFIG.OT.MORNING;
            }
        }

        const pagiMinute = Math.round(pagi * 60);
        const soreMinute = Math.round(sore * 60);

        const jamMasuk = rule.holiday ? rule.start : Helper.subtractMinute(rule.start, pagiMinute);
        
        let breakMinute = 0;
        if (rule.holiday && (Helper.toMinute(rule.start) + soreMinute) >= Helper.toMinute(CONFIG.WORK.BREAK_START)) {
            breakMinute = CONFIG.WORK.BREAK_DURATION;
        }
        const jamPulang = rule.holiday ? Helper.addMinute(rule.start, soreMinute + breakMinute) : Helper.addMinute(rule.end, soreMinute);

        const reminder = [];
        CONFIG.REMINDER.BEFORE.forEach(min => {
            reminder.push({ type: "masuk", minute: min, time: Helper.subtractMinute(jamMasuk, min) });
            reminder.push({ type: "pulang", minute: min, time: Helper.subtractMinute(jamPulang, min) });
        });
        reminder.sort((a, b) => Helper.toMinute(a.time) - Helper.toMinute(b.time));

        return {
            tanggal, bulan, tahun,
            day: this.getDay(tanggal, bulan, tahun),
            dayName: this.getDayName(tanggal, bulan, tahun),
            holiday: rule.holiday, working: !rule.holiday,
            status: rule.holiday ? CONFIG.STATUS.HOLIDAY_OT : (otTotal > 0 ? CONFIG.STATUS.WORK_OT : CONFIG.STATUS.WORK),
            ot: { total: otTotal, pagi, sore, pagiMinute, soreMinute },
            jamMasuk, jamPulang, reminder
        };
    },
    getScheduleData(targetBulan, targetTahun) {
        const key = Storage.getScheduleKey(targetTahun, targetBulan);
        let data = Storage.load(key);
        
        if (!data) {
            const totalDay = new Date(targetTahun, targetBulan, 0).getDate();
            const jadwal = [];
            for (let i = 1; i <= totalDay; i++) {
                jadwal.push({ tanggal: i, ot: 0 });
            }
            data = { bulan: Number(targetBulan), tahun: Number(targetTahun), jadwal };
            Storage.save(key, data);
        }
        return data;
    },
    getSpecificTotalOT(tanggal, bulan, tahun) {
        const schedule = this.getScheduleData(bulan, tahun);
        const data = schedule.jadwal.find(item => Number(item.tanggal) === Number(tanggal));
        return data ? Number(data.ot || 0) : 0;
    }
};

/*=========================================
DASHBOARD MODULE (WITH SYSTEM NOTIFICATION)
=========================================*/
const Dashboard = {
    timer: null,
    schedule: null,

    init() {
        this.load();
    },
    load() {
        const now = new Date();
        this.schedule = Engine.getWorkSchedule(now.getDate(), now.getMonth() + 1, now.getFullYear(), Engine.getSpecificTotalOT(now.getDate(), now.getMonth() + 1, now.getFullYear()));
        this.render();
    },
    refresh() {
        this.stopCountdown();
        this.load();
        this.startCountdown();
    },
    render() {
        if (!this.schedule) return;
        
        const profile = Storage.load(CONFIG.STORAGE.PROFILE);
        if (EL.headerName) EL.headerName.textContent = profile?.nama || CONFIG.APP.NAME;
        if (EL.headerDept) EL.headerDept.textContent = profile?.departemen || "Selamat Datang";
        if (EL.headerPhoto) EL.headerPhoto.src = profile?.photo || CONFIG.PROFILE.DEFAULT_PHOTO;

        if (EL.todayDate) EL.todayDate.textContent = Helper.formatDateIndonesia(this.schedule.tanggal, this.schedule.bulan, this.schedule.tahun, this.schedule.dayName);
        if (EL.todayInfo) EL.todayInfo.textContent = this.schedule.status;
        if (EL.todayOT) EL.todayOT.textContent = `${this.schedule.ot.total} Jam`;
        if (EL.jamMasuk) EL.jamMasuk.textContent = this.schedule.jamMasuk;
        if (EL.jamPulang) EL.jamPulang.textContent = this.schedule.jamPulang;
        
        if (EL.exportBulan) EL.exportBulan.value = this.schedule.bulan;
        if (EL.exportTahun) EL.exportTahun.value = this.schedule.tahun;
    },
    getCountdownTarget() {
        const now = new Date();
        const currentMinute = (now.getHours() * 60) + now.getMinutes();

        let nextReminder = null;
        this.schedule.reminder.forEach(item => {
            const min = Helper.toMinute(item.time);
            if (min >= currentMinute && (!nextReminder || min < Helper.toMinute(nextReminder.time))) {
                nextReminder = item;
            }
        });

        if (nextReminder) {
            return { 
                type: "REMINDER_TODAY", 
                timeStr: nextReminder.time, 
                label: `Reminder Hari Ini: Absen ${nextReminder.type === "masuk" ? "Masuk" : "Pulang"}`, 
                targetDate: now 
            };
        }

        const besok = new Date();
        besok.setDate(now.getDate() + 1);
        
        const besokTanggal = besok.getDate();
        const besokBulan = besok.getMonth() + 1;
        const besokTahun = besok.getFullYear();
        const besokDayName = Engine.getDayName(besokTanggal, besokBulan, besokTahun);
        
        const besokSchedule = Engine.getWorkSchedule(besokTanggal, besokBulan, besokTahun, Engine.getSpecificTotalOT(besokTanggal, besokBulan, besokTahun));

        if (besokSchedule.holiday && besokSchedule.ot.total === 0) {
            return {
                type: "LIBUR_BESOK",
                label: "Reminder Berikutnya:",
                subLabel1: `${besokDayName}, ${besokTanggal} ${Helper.getMonthName(besokBulan)} ${besokTahun}`,
                subLabel2: "Status: LIBUR (Istirahat)"
            };
        }

        return {
            type: "KERJA_BESOK",
            timeStr: besokSchedule.jamMasuk,
            label: "Reminder Besok:",
            subLabel1: `${besokDayName}, ${besokTanggal} ${Helper.getMonthName(besokBulan)} ${besokTahun}`,
            subLabel2: `Jam Masuk: ${besokSchedule.jamMasuk}`,
            targetDate: besok
        };
    },
    // FUNGSI BARU: Mengirim Notifikasi ke Sistem HP Android WebView
    showSystemNotification(title, message) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
                body: message,
                icon: "assets/default-profile.png"
            });
        } else {
            console.log(`[TRIGGER REMINDER FALLBACK]: ${title} - ${message}`);
        }
    },
    updateCountdownLoop() {
        const target = this.getCountdownTarget();

        if (!target) {
            if (EL.reminderText) EL.reminderText.textContent = "Tidak ada jadwal";
            if (EL.countdown) EL.countdown.textContent = "--:--:--";
            return;
        }

        if (target.type === "LIBUR_BESOK") {
            if (EL.reminderText) EL.reminderText.innerHTML = `${target.label}<br><strong>${target.subLabel1}</strong><br><small>${target.subLabel2}</small>`;
            if (EL.countdown) EL.countdown.textContent = "LIBUR";
            this.stopCountdown(); 
            return;
        }

        if (target.type === "KERJA_BESOK") {
            if (EL.reminderText) EL.reminderText.innerHTML = `${target.label}<br><strong>${target.subLabel1}</strong><br><small>${target.subLabel2}</small>`;
        } else {
            if (EL.reminderText) EL.reminderText.textContent = target.label;
        }

        const now = new Date();
        const timeTarget = new Date(target.targetDate.getTime());
        const [h, m] = target.timeStr.split(":").map(Number);
        timeTarget.setHours(h, m, 0, 0);

        const diff = timeTarget.getTime() - now.getTime();

        if (diff <= 0) {
            if (EL.countdown) EL.countdown.textContent = "00:00:00";
            
            // LOGIKA BARU: Tembak Notifikasi ke HP sebelum refresh halaman dilakukan
            const infoMsg = target.type === "REMINDER_TODAY" ? "Waktunya melakukan absen kerja!" : "Persiapan untuk jadwal besok.";
            this.showSystemNotification("Pengingat Absen!", `${target.label}. ${infoMsg}`);
            
            this.refresh();
            return;
        }

        const totalSec = Math.floor(diff / 1000);
        const hours = Math.floor(totalSec / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;

        if (EL.countdown) EL.countdown.textContent = `${Helper.pad(hours)}:${Helper.pad(minutes)}:${Helper.pad(seconds)}`;
    },
    startCountdown() {
        this.stopCountdown();
        this.updateCountdownLoop();
        this.timer = setInterval(() => this.updateCountdownLoop(), 1000);
    },
    stopCountdown() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    },
    start() {
        this.init();
        this.startCountdown();
    },
    destroy() {
        this.stopCountdown();
    }
};

/*=========================================
PLANNING MODULE (REVERTED TO OLD RENDER + POPUP TARGET)
=========================================*/
const Planning = {
    monthData: [],
    currentMonth: 0,
    currentYear: 0,
    calendarMode: true,

    init() {
        this.load();
    },
    load() {
        const now = new Date();
        this.currentMonth = now.getMonth() + 1;
        this.currentYear = now.getFullYear();
        this.refreshData();
        this.bind();
    },
    refreshData() {
        const data = Engine.getScheduleData(this.currentMonth, this.currentYear);
        this.monthData = [];
        const totalDay = new Date(data.tahun, data.bulan, 0).getDate();
        for (let i = 1; i <= totalDay; i++) {
            const item = data.jadwal.find(x => Number(x.tanggal) === i);
            const ot = item ? Number(item.ot) : 0;
            this.monthData.push(Engine.getWorkSchedule(i, data.bulan, data.tahun, ot));
        }
        this.render();
    },
    render() {
        this.renderList();
        this.renderCalendar(document.getElementById("calendarView"));
        this.renderCalendar(document.getElementById("calendarViewModal")); // Merender juga ke grid dalam modal popup
        this.switchMode(this.calendarMode);
    },
    renderList() {
        if (!EL.planningList) return;
        EL.planningList.innerHTML = "";
        const now = new Date();

        this.monthData.forEach(day => {
            const item = document.createElement("div");
            item.className = "planning-item";
            if (day.tanggal === now.getDate() && day.bulan === (now.getMonth() + 1) && day.tahun === now.getFullYear()) {
                item.classList.add("today");
            }
            item.dataset.tanggal = day.tanggal;
            item.innerHTML = `
                <div class="planning-left">
                    <strong>${day.dayName}, ${day.tanggal}</strong>
                    <div>${day.status}</div>
                </div>
                <div class="planning-right">
                    <div>${day.ot.total} Jam</div>
                    <small>${day.jamMasuk} - ${day.jamPulang}</small>
                </div>
            `;
            EL.planningList.appendChild(item);
        });
    },
    // VERSI ASLI (LAMA): Merender tanggal bulat berdampingan dengan badge total lembur
    renderCalendar(targetElement) {
        if (!targetElement) return;
        targetElement.innerHTML = "";
        const now = new Date();

        const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            empty.className = "calendar-empty";
            targetElement.appendChild(empty);
        }

        this.monthData.forEach(day => {
            const cell = document.createElement("div");
            cell.className = "calendar-day";
            if (day.holiday) cell.classList.add("holiday");
            if (day.ot.total > 0) cell.classList.add("ot");
            if (day.tanggal === now.getDate() && day.bulan === (now.getMonth() + 1) && day.tahun === now.getFullYear()) {
                cell.classList.add("today");
            }
            cell.dataset.tanggal = day.tanggal;
            cell.innerHTML = `
                <div class="calendar-date">${day.tanggal}</div>
                <div class="calendar-total">${day.ot.total} Jam</div>
            `;
            targetElement.appendChild(cell);
        });
    },
    switchMode(calendar = true) {
        this.calendarMode = calendar;
        const boxWrapper = document.getElementById("calendarBoxWrapper");
        
        if (calendar) {
            if (EL.calendarHeaderWrapper) EL.calendarHeaderWrapper.style.setProperty("display", "grid", "important");
            if (boxWrapper) boxWrapper.style.setProperty("display", "block", "important");
            if (EL.planningList) EL.planningList.style.setProperty("display", "none", "important");
        } else {
            if (EL.calendarHeaderWrapper) EL.calendarHeaderWrapper.style.setProperty("display", "none", "important");
            if (boxWrapper) boxWrapper.style.setProperty("display", "none", "important");
            if (EL.planningList) EL.planningList.style.setProperty("display", "flex", "important");
        }
    },
    refresh() {
        this.refreshData();
    },
    bind() {
        EL.calendarMode?.replaceWith(EL.calendarMode.cloneNode(true));
        EL.calendarMode = $("calendarMode");
        EL.calendarMode?.addEventListener("click", () => this.switchMode(true));

        EL.listMode?.replaceWith(EL.listMode.cloneNode(true));
        EL.listMode = $("listMode");
        EL.listMode?.addEventListener("click", () => this.switchMode(false));

        // Event trigger buka dan tutup modal popup zoom kalender
        const modal = document.getElementById("calendarModal");
        document.getElementById("btnExpandCalendar")?.addEventListener("click", () => {
            if (modal) modal.classList.add("open");
        });
        document.getElementById("btnCloseCalendarModal")?.addEventListener("click", () => {
            if (modal) modal.classList.remove("open");
        });

        // Handler klik tanggal untuk kalender biasa dan kalender popup modal
        const handlerClick = e => {
            const cell = e.target.closest(".calendar-day");
            if (cell) {
                if (modal) modal.classList.remove("open"); // Tutup otomatis jika sedang membuka modal
                EditOT.fill(Number(cell.dataset.tanggal), this.currentMonth, this.currentYear);
                Navigation.open("editPage");
            }
        };

        document.getElementById("calendarView")?.addEventListener("click", handlerClick);
        document.getElementById("calendarViewModal")?.addEventListener("click", handlerClick);

        EL.planningList?.replaceWith(EL.planningList.cloneNode(true));
        EL.planningList = $("planningList");
        EL.planningList?.addEventListener("click", e => {
            const item = e.target.closest(".planning-item");
            if (item) {
                EditOT.fill(Number(item.dataset.tanggal), this.currentMonth, this.currentYear);
                Navigation.open("editPage");
            }
        });
    }
};

/*=========================================
EDIT OT MODULE
=========================================*/
const EditOT = {
    data: null,
    currentTanggal: null,
    currentBulan: null,
    currentTahun: null,

    init() {
        const now = new Date();
        this.currentTanggal = now.getDate();
        this.currentBulan = now.getMonth() + 1;
        this.currentTahun = now.getFullYear();
        this.load();
        this.bind();
    },
    load() {
        this.data = Engine.getScheduleData(this.currentBulan, this.currentTahun);
    },
    refresh() {
        this.load();
    },
    fill(tanggal, bulan, tahun) {
        const now = new Date();
        this.currentTanggal = tanggal ? Number(tanggal) : now.getDate();
        this.currentBulan = bulan ? Number(bulan) : this.currentBulan || (now.getMonth() + 1);
        this.currentTahun = tahun ? Number(tahun) : this.currentTahun || now.getFullYear();

        this.refresh();

        let item = this.data.jadwal.find(x => Number(x.tanggal) === this.currentTanggal);
        if (!item) {
            item = { tanggal: this.currentTanggal, ot: 0 };
            this.data.jadwal.push(item);
        }

        const schedule = Engine.getWorkSchedule(item.tanggal, this.currentBulan, this.currentTahun, item.ot);

        if (EL.editTanggal) {
            EL.editTanggal.value = `${this.currentTahun}-${Helper.pad(this.currentBulan)}-${Helper.pad(item.tanggal)}`;
        }

        if (schedule.holiday) {
            if (EL.otPagi) {
                EL.otPagi.value = 0;
                EL.otPagi.disabled = true;
            }
            if (EL.otSore) {
                EL.otSore.value = schedule.ot.total; 
                EL.otSore.disabled = false;
            }
            if (EL.labelOtPagi) EL.labelOtPagi.textContent = "OT Pagi (Hari Libur Otomatis 0)";
            if (EL.labelOtSore) EL.labelOtSore.textContent = "Total Jam Lembur Hari Libur (Full OT)";
        } else {
            if (EL.otPagi) {
                EL.otPagi.value = schedule.ot.pagi;
                EL.otPagi.disabled = false;
            }
            if (EL.otSore) {
                EL.otSore.value = schedule.ot.sore;
                EL.otSore.disabled = false;
            }
            if (EL.labelOtPagi) EL.labelOtPagi.textContent = "OT Pagi";
            if (EL.labelOtSore) EL.labelOtSore.textContent = "OT Sore";
        }

        this.updateLivePreview();
    },
    updateLivePreview() {
        if (!EL.livePreviewBox) return;

        const p = parseFloat(EL.otPagi?.value) || 0;
        const s = parseFloat(EL.otSore?.value) || 0;
        const total = p + s;

        const sim = Engine.getWorkSchedule(this.currentTanggal, this.currentBulan, this.currentTahun, total, p);

        if (sim.jamMasuk === "-") {
            EL.livePreviewBox.innerHTML = `<strong>Simulasi Hasil:</strong> Hari Libur (Tidak Bekerja / Istirahat)`;
        } else {
            EL.livePreviewBox.innerHTML = `<strong>Simulasi Hasil:</strong> Jam Masuk: <span style="color:blue">${sim.jamMasuk}</span> | Jam Pulang: <span style="color:green">${sim.jamPulang}</span> <br><small>(${sim.status} - Total Lembur: ${sim.ot.total} Jam)</small>`;
        }
    },
    save() {
        const pagi = parseFloat(EL.otPagi?.value) || 0;
        const sore = parseFloat(EL.otSore?.value) || 0;

        if (!Validator.ot(pagi) || !Validator.ot(sore)) {
            alert("Input nilai OT tidak valid! (Maksimal akumulasi 24 Jam)");
            return;
        }

        const totalOT = pagi + sore;
        const index = this.data.jadwal.findIndex(x => Number(x.tanggal) === this.currentTanggal);
        
        if (index !== -1) {
            this.data.jadwal[index].ot = totalOT;
        } else {
            this.data.jadwal.push({ tanggal: this.currentTanggal, ot: totalOT });
        }

        const key = Storage.getScheduleKey(this.currentTahun, this.currentBulan);
        Storage.save(key, this.data);
        
        Dashboard.refresh();
        Planning.refresh();
        alert("Data OT Berhasil Disimpan.");
    },
    bind() {
        EL.saveOT?.replaceWith(EL.saveOT.cloneNode(true));
        EL.saveOT = $("saveOT");
        EL.saveOT?.addEventListener("click", () => this.save());

        EL.editTanggal?.replaceWith(EL.editTanggal.cloneNode(true));
        EL.editTanggal = $("editTanggal");
        EL.editTanggal?.addEventListener("change", e => {
            if (!e.target.value) return;
            const parts = e.target.value.split("-"); 
            
            this.currentTahun = Number(parts[0]);
            this.currentBulan = Number(parts[1]);
            const newDay = Number(parts[2]);

            this.fill(newDay, this.currentBulan, this.currentTahun);
        });

        EL.otPagi?.addEventListener("input", () => this.updateLivePreview());
        EL.otSore?.addEventListener("input", () => this.updateLivePreview());
    }
};

/*=========================================
PROFILE MODULE
=========================================*/
const Profile = {
    data: null,
    init() {
        this.load();
        this.fill();
        this.bind();
    },
    load() {
        this.data = Storage.load(CONFIG.STORAGE.PROFILE) || {
            nama: CONFIG.PROFILE.DEFAULT_NAME,
            nik: CONFIG.PROFILE.DEFAULT_NIK,
            departemen: CONFIG.PROFILE.DEFAULT_DEPARTMENT,
            phone: CONFIG.PROFILE.DEFAULT_PHONE,
            photo: CONFIG.PROFILE.DEFAULT_PHOTO
        };
    },
    fill() {
        if (!EL.profileName) return;
        EL.profileName.value = this.data.nama;
        EL.profileNik.value = this.data.nik;
        EL.profileDept.value = this.data.departemen;
        EL.profilePhone.value = this.data.phone;
        if (EL.profilePhoto) EL.profilePhoto.src = this.data.photo;
    },
    save() {
        if (!EL.profileName.value.trim()) {
            alert("Nama tidak boleh kosong.");
            return;
        }
        this.data.nama = EL.profileName.value.trim();
        this.data.nik = EL.profileNik.value.trim();
        this.data.departemen = EL.profileDept.value.trim();
        this.data.phone = EL.profilePhone.value.trim();

        Storage.save(CONFIG.STORAGE.PROFILE, this.data);
        Dashboard.refresh();
        alert("Profil berhasil disimpan.");
    },
    bind() {
        EL.saveProfile?.addEventListener("click", () => this.save());
        EL.profileUpload?.addEventListener("change", e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                this.data.photo = reader.result;
                if (EL.profilePhoto) EL.profilePhoto.src = reader.result;
                Storage.save(CONFIG.STORAGE.PROFILE, this.data);
                Dashboard.refresh();
            };
            reader.readAsDataURL(file);
        });
    }
};

/*=========================================
IMPORT & EXPORT MODULE
=========================================*/
const ImportData = {
    selectedFile: null,
    init() { this.bind(); },
    bind() {
        EL.uploadJson?.addEventListener("change", e => { this.selectedFile = e.target.files[0]; });
        
        EL.importBtn?.addEventListener("click", () => {
            if (!this.selectedFile) { alert("Pilih file JSON terlebih dahulu!"); return; }
            const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const parsed = JSON.parse(ev.target.result);
                    if (!Validator.json(parsed)) throw new Error("Format objek salah.");
                    
                    const key = Storage.getScheduleKey(parsed.tahun, parsed.bulan);
                    
                    if (localStorage.getItem(key)) {
                        const yakin = confirm(`Data Lembur untuk bulan ${Helper.getMonthName(parsed.bulan)} ${parsed.tahun} sudah ada di memori. Apakah Anda ingin menimpanya dengan data dari file JSON ini?`);
                        if (!yakin) return;
                    }

                    Storage.save(key, parsed);
                    Dashboard.refresh(); 
                    Planning.refresh(); 
                    EditOT.init();
                    alert("Import Sukses dan Berhasil Disinkronkan!");
                } catch(err) { 
                    alert("Gagal Impor: Format data file JSON tidak cocok dengan sistem."); 
                }
            };
            reader.readAsText(this.selectedFile);
        });

        EL.exportBtn?.replaceWith(EL.exportBtn.cloneNode(true));
        EL.exportBtn = $("exportBtn");
        EL.exportBtn?.addEventListener("click", () => {
            const targetBulan = Number(EL.exportBulan?.value || new Date().getMonth() + 1);
            const targetTahun = Number(EL.exportTahun?.value || new Date().getFullYear());
            
            const key = Storage.getScheduleKey(targetTahun, targetBulan);
            const targetData = Storage.load(key);

            if (!targetData || !targetData.jadwal || targetData.jadwal.every(item => Number(item.ot) === 0)) {
                alert(`⚠️ Peringatan: Data lembur untuk bulan ${Helper.getMonthName(targetBulan)} ${targetTahun} tidak ditemukan atau kosong. Proses ekspor dibatalkan.`);
                return;
            }

            const blob = new Blob([JSON.stringify(targetData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Jadwal_OT_${targetTahun}_${Helper.pad(targetBulan)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });

        EL.clearScheduleBtn?.addEventListener("click", () => {
            if (confirm("Hapus seluruh histori lembur di bulan aktif saat ini?")) {
                const key = Storage.getScheduleKey(Planning.currentYear, Planning.currentMonth);
                Storage.remove(key);
                Dashboard.refresh(); Planning.refresh(); EditOT.init();
            }
        });
    }
};

/*=========================================
NAVIGATION LAYER
=========================================*/
const Navigation = {
    currentPage: "homePage",
    init() {
        this.bind();
        this.open(this.currentPage);
    },
    open(pageId) {
        if (!pageId) return;
        EL.pages.forEach(p => p.classList.remove("active"));
        const target = $(pageId);
        if (target) target.classList.add("active");

        EL.navButtons.forEach(btn => {
            btn.classList.remove("active");
            if (btn.dataset.page === pageId) btn.classList.add("active");
        });

        this.currentPage = pageId;
        if (pageId === "editPage") {
            EditOT.fill(EditOT.currentTanggal, EditOT.currentBulan, EditOT.currentTahun);
        }
    },
    bind() {
        EL.navButtons?.forEach(btn => {
            btn.addEventListener("click", () => this.open(btn.dataset.page));
        });
    }
};

/*=========================================
APPLICATION INITIALIZER
=========================================*/
const App = {
    initialized: false,
    init() {
        if (this.initialized) return;
        this.initialized = true;
        try {
            Dashboard.init();
            Planning.init();
            EditOT.init();
            Profile.init();
            ImportData.init();
            Navigation.init();
            Dashboard.start();
            
            // MEMINTA IZIN NOTIFIKASI SECARA EKSPLISIT SAAT APLIKASI DIBUKA
            if ("Notification" in window && Notification.permission !== "granted") {
                Notification.requestPermission().then(permission => {
                    console.log(`[PERMISSION STATUS]: Notifikasi ${permission}`);
                });
            }

            debug(`${CONFIG.APP.NAME} V${CONFIG.APP.VERSION} Initialized Successfully.`);
        } catch (error) {
            console.error("Initialization Failed:", error);
        }
    }
};

document.addEventListener("DOMContentLoaded", () => App.init());