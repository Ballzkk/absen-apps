/*
=========================================
 APP ABSEN V2
 Version : 2.2.0 (Full Upgraded)
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
        SCHEDULE_PREFIX: "jadwalOT_", 
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
        DEFAULT_NAME: "Karyawan",
        DEFAULT_DEPARTMENT: "Belum mengatur departemen",
        DEFAULT_PHONE: "",
        DEFAULT_PHOTO: "assets/default-profile.png"
    }
};

/*=========================================
ELEMENT UTILITY (SINKRONISASI ID STRUKTUR HTML BARU)
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
    countdown: $("countdownText"), // Sinkronisasi ID countdownText HTML
    planningList: $("planningList"),
    calendarView: $("calendarView"),
    calendarHeaderWrapper: $("calendarHeaderWrapper"), // ID Pembungkus Header Hari
    btnSwitchCalendar: $("btnSwitchCalendar"),
    btnSwitchList: $("btnSwitchList"),
    editTanggal: $("editTanggal"),
    editOT: $("editOT"),
    btnMinOT: $("btnMinOT"),
    btnPlusOT: $("btnPlusOT"),
    livePreviewBox: $("livePreview"), // Sinkronisasi ID livePreview HTML
    saveOT: $("saveOT"),
    importFile: $("importFile"),
    btnImport: $("btnImport"),
    btnExport: $("btnExport"),
    exportBulan: $("exportBulan"),   
    exportTahun: $("exportTahun"),   
    btnClearOT: $("btnClearOT"),
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
DASHBOARD MODULE (FIXED ANTI-UNDEFINED RENDER)
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
        
        // PROTEKSI STRICT AGAR TIDAK PERNAH MENAMPILKAN STRING "undefined"
        const finalName = (profile?.nama && profile.nama.trim() !== "" && profile.nama !== "undefined") ? profile.nama : CONFIG.PROFILE.DEFAULT_NAME;
        const finalDept = (profile?.departemen && profile.departemen.trim() !== "" && profile.departemen !== "undefined") ? profile.departemen : CONFIG.PROFILE.DEFAULT_DEPARTMENT;

        if (EL.headerName) EL.headerName.textContent = finalName;
        if (EL.headerDept) EL.headerDept.textContent = finalDept;
        if (EL.headerPhoto) EL.headerPhoto.src = profile?.photo || CONFIG.PROFILE.DEFAULT_PHOTO;

        if (EL.todayDate) EL.todayDate.textContent = Helper.formatDateIndonesia(this.schedule.tanggal, this.schedule.bulan, this.schedule.tahun, this.schedule.dayName);
        if (EL.todayInfo) EL.todayInfo.textContent = this.schedule.status;
        if (EL.todayOT) EL.todayOT.textContent = `${this.schedule.ot.total} Jam`;
        if (EL.jamMasuk) EL.jamMasuk.textContent = this.schedule.jamMasuk;
        if (EL.jamPulang) EL.jamPulang.textContent = this.schedule.jamPulang;
        
        if (EL.exportBulan) EL.exportBulan.value = this.schedule.bulan;
        if (EL.exportTahun) {
            // Isi pilihan dropdown tahun dinamis jika kosong
            if (EL.exportTahun.options.length === 0) {
                const currentY = this.schedule.tahun;
                for (let y = currentY - 2; y <= currentY + 2; y++) {
                    const opt = document.createElement("option");
                    opt.value = y; opt.textContent = y;
                    EL.exportTahun.appendChild(opt);
                }
            }
            EL.exportTahun.value = this.schedule.tahun;
        }
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
                label: `Absen ${nextReminder.type === "masuk" ? "Masuk" : "Pulang"}`, 
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
                label: "Reminder Besok:",
                subLabel1: `${besokDayName}, ${besokTanggal} ${Helper.getMonthName(besokBulan)}`,
                subLabel2: "Status: Hari Libur (Istirahat)"
            };
        }

        return {
            type: "KERJA_BESOK",
            timeStr: besokSchedule.jamMasuk,
            label: "Reminder Besok:",
            subLabel1: `${besokDayName}, ${besokTanggal} ${Helper.getMonthName(besokBulan)}`,
            subLabel2: `Jam Masuk: ${besokSchedule.jamMasuk}`,
            targetDate: besok
        };
    },
    updateCountdownLoop() {
        const target = this.getCountdownTarget();

        if (!target) {
            if (EL.reminderText) EL.reminderText.textContent = "Tidak ada jadwal";
            if (EL.countdown) EL.countdown.textContent = "--:--:--";
            return;
        }

        if (target.type === "LIBUR_BESOK") {
            if (EL.reminderText) EL.reminderText.innerHTML = `${target.label} <strong>${target.subLabel1}</strong> (${target.subLabel2})`;
            if (EL.countdown) EL.countdown.textContent = "LIBUR";
            return;
        }

        if (target.type === "KERJA_BESOK") {
            if (EL.reminderText) EL.reminderText.innerHTML = `${target.label} <strong>${target.subLabel1}</strong> - ${target.subLabel2}`;
        } else {
            if (EL.reminderText) EL.reminderText.textContent = `Reminder Hari Ini: ${target.label}`;
        }

        const now = new Date();
        const timeTarget = new Date(target.targetDate.getTime());
        const [h, m] = target.timeStr.split(":").map(Number);
        timeTarget.setHours(h, m, 0, 0);

        const diff = timeTarget.getTime() - now.getTime();

        if (diff <= 0) {
            if (EL.countdown) EL.countdown.textContent = "00:00:00";
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
PLANNING MODULE (WITH ACCURATE CALENDAR POPUP MODE)
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
        this.renderCalendar(document.getElementById("calendarViewModal"));
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
                    <strong>${day.dayName}, ${day.tanggal} ${Helper.getMonthName(day.bulan)}</strong>
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
            
            // Format render lama: Angka tanggal & badge total jam lembur selalu dicetak bersamaan
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
            EL.btnSwitchCalendar?.classList.add("active");
            EL.btnSwitchList?.classList.remove("active");
            if (EL.calendarHeaderWrapper) EL.calendarHeaderWrapper.style.setProperty("display", "grid", "important");
            if (boxWrapper) boxWrapper.style.setProperty("display", "block", "important");
            if (EL.planningList) EL.planningList.style.setProperty("display", "none", "important");
        } else {
            EL.btnSwitchCalendar?.classList.remove("active");
            EL.btnSwitchList?.classList.add("active");
            if (EL.calendarHeaderWrapper) EL.calendarHeaderWrapper.style.setProperty("display", "none", "important");
            if (boxWrapper) boxWrapper.style.setProperty("none", "none", "important");
            if (boxWrapper) boxWrapper.style.display = "none";
            if (EL.planningList) EL.planningList.style.setProperty("display", "flex", "important");
        }
    },
    refresh() {
        this.refreshData();
    },
    bind() {
        // Switch Buttons
        document.getElementById("btnSwitchCalendar")?.addEventListener("click", () => this.switchMode(true));
        document.getElementById("btnSwitchList")?.addEventListener("click", () => this.switchMode(false));

        // Modal Action Trigger
        const modal = document.getElementById("calendarModal");
        document.getElementById("btnExpandCalendar")?.addEventListener("click", () => {
            if(modal) modal.classList.add("open");
        });
        document.getElementById("btnCloseCalendarModal")?.addEventListener("click", () => {
            if(modal) modal.classList.remove("open");
        });

        // Click on normal grid & modal grid
        const handlerClick = e => {
            const cell = e.target.closest(".calendar-day");
            if (cell) {
                if(modal) modal.classList.remove("open");
                EditOT.fill(Number(cell.dataset.tanggal), this.currentMonth, this.currentYear);
                Navigation.open("editPage");
            }
        };

        document.getElementById("calendarView")?.addEventListener("click", handlerClick);
        document.getElementById("calendarViewModal")?.addEventListener("click", handlerClick);
        
        document.getElementById("planningList")?.addEventListener("click", e => {
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

        if (EL.editTanggal) {
            EL.editTanggal.value = `${this.currentTahun}-${Helper.pad(this.currentBulan)}-${Helper.pad(item.tanggal)}`;
        }

        if (EL.editOT) {
            EL.editOT.value = item.ot;
        }

        this.updateLivePreview();
    },
    updateLivePreview() {
        if (!EL.livePreviewBox) return;

        const total = parseFloat(EL.editOT?.value) || 0;
        const sim = Engine.getWorkSchedule(this.currentTanggal, this.currentBulan, this.currentTahun, total);

        if (sim.jamMasuk === "-") {
            EL.livePreviewBox.innerHTML = `<strong>Detail Rencana:</strong><br>Hari Libur / Istirahat (Tidak ada jam kerja)`;
        } else {
            EL.livePreviewBox.innerHTML = `<strong>Detail Rencana:</strong><br>Jam Masuk: <span style="color:#7F8CFF; font-weight:700;">${sim.jamMasuk}</span> | Jam Pulang: <span style="color:#7F8CFF; font-weight:700;">${sim.jamPulang}</span><br><small>${sim.status} (Total Lembur: ${sim.ot.total} Jam)</small>`;
        }
    },
    save() {
        const totalOT = parseFloat(EL.editOT?.value) || 0;

        if (!Validator.ot(totalOT)) {
            alert("Input nilai OT tidak valid! (Maksimal batas lembur 24 Jam)");
            return;
        }

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

        EL.btnMinOT?.replaceWith(EL.btnMinOT.cloneNode(true));
        EL.btnMinOT = $("btnMinOT");
        EL.btnMinOT?.addEventListener("click", () => {
            let current = parseFloat(EL.editOT.value) || 0;
            if (current > 0) {
                EL.editOT.value = current - 0.5;
                this.updateLivePreview();
            }
        });

        EL.btnPlusOT?.replaceWith(EL.btnPlusOT.cloneNode(true));
        EL.btnPlusOT = $("btnPlusOT");
        EL.btnPlusOT?.addEventListener("click", () => {
            let current = parseFloat(EL.editOT.value) || 0;
            if (current < CONFIG.WORK.MAX_OT) {
                EL.editOT.value = current + 0.5;
                this.updateLivePreview();
            }
        });
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
        EL.profileName.value = this.data.nama === CONFIG.PROFILE.DEFAULT_NAME ? "" : this.data.nama;
        EL.profileNik.value = this.data.nik;
        EL.profileDept.value = this.data.departemen === CONFIG.PROFILE.DEFAULT_DEPARTMENT ? "" : this.data.departemen;
        EL.profilePhone.value = this.data.phone;
        if (EL.profilePhoto) EL.profilePhoto.src = this.data.photo || CONFIG.PROFILE.DEFAULT_PHOTO;
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
        EL.importFile?.addEventListener("change", e => { this.selectedFile = e.target.files[0]; });
        
        EL.btnImport?.addEventListener("click", () => {
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

        EL.btnExport?.replaceWith(EL.btnExport.cloneNode(true));
        EL.btnExport = $("btnExport");
        EL.btnExport?.addEventListener("click", () => {
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

        EL.btnClearOT?.addEventListener("click", () => {
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
            debug(`${CONFIG.APP.NAME} V${CONFIG.APP.VERSION} Initialized Successfully.`);
        } catch (error) {
            console.error("Initialization Failed:", error);
        }
    }
};

document.addEventListener("DOMContentLoaded", () => App.init());
