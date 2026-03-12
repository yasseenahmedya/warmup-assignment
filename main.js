const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    // TODO: Implement this function
    function timeToSeconds(timeStr) {
        if (typeof timeStr !== "string") return NaN;

        timeStr = timeStr.trim().toLowerCase();
        let parts = timeStr.split(" ");

        if (parts.length !== 2) return NaN;

        let time = parts[0];
        let period = parts[1];

        let t = time.split(":");
        if (t.length !== 3) return NaN;

        let hours = parseInt(t[0]);
        let minutes = parseInt(t[1]);
        let seconds = parseInt(t[2]);

        if (
            isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
            minutes < 0 || minutes >= 60 ||
            seconds < 0 || seconds >= 60 ||
            hours < 1 || hours > 12
        ) {
            return NaN;
        }

        if (period === "pm" && hours !== 12) hours += 12;
        if (period === "am" && hours === 12) hours = 0;

        return hours * 3600 + minutes * 60 + seconds;
    }

    let startSec = timeToSeconds(startTime);
    let endSec = timeToSeconds(endTime);

    if (isNaN(startSec) || isNaN(endSec) || endSec < startSec) {
        return "0:00:00";
    }

    let diff = endSec - startSec;

    let h = Math.floor(diff / 3600);
    let m = Math.floor((diff % 3600) / 60);
    let s = diff % 60;

    let mm = String(m).padStart(2, "0");
    let ss = String(s).padStart(2, "0");

    return `${h}:${mm}:${ss}`;

}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    // TODO: Implement this function
    function timeToSeconds(timeStr) {
        timeStr = timeStr.trim().toLowerCase();
        let parts = timeStr.split(" ");
        let time = parts[0];
        let period = parts[1];

        let t = time.split(":");
        let hours = parseInt(t[0]);
        let minutes = parseInt(t[1]);
        let seconds = parseInt(t[2]);

        if (period === "pm" && hours !== 12) hours += 12;
        if (period === "am" && hours === 12) hours = 0;

        return hours * 3600 + minutes * 60 + seconds;
    }

    let startSec = timeToSeconds(startTime);
    let endSec = timeToSeconds(endTime);

    let deliveryStart = 8 * 3600;   // 8:00 AM
    let deliveryEnd = 22 * 3600;    // 10:00 PM

    let idle = 0;

    if (startSec < deliveryStart) {
        idle += Math.min(endSec, deliveryStart) - startSec;
    }

    if (endSec > deliveryEnd) {
        idle += endSec - Math.max(startSec, deliveryEnd);
    }

    let h = Math.floor(idle / 3600);
    let m = Math.floor((idle % 3600) / 60);
    let s = idle % 60;

    let mm = String(m).padStart(2, "0");
    let ss = String(s).padStart(2, "0");

    return `${h}:${mm}:${ss}`;
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    // TODO: Implement this function
    function timeToSeconds(timeStr) {
        timeStr = timeStr.trim();
        let parts = timeStr.split(":");

        let h = parseInt(parts[0]);
        let m = parseInt(parts[1]);
        let s = parseInt(parts[2]);

        return h * 3600 + m * 60 + s;
    }

    let shiftSec = timeToSeconds(shiftDuration);
    let idleSec = timeToSeconds(idleTime);

    let activeSec = shiftSec - idleSec;

    if (activeSec < 0) activeSec = 0;

    let h = Math.floor(activeSec / 3600);
    let m = Math.floor((activeSec % 3600) / 60);
    let s = activeSec % 60;

    let mm = String(m).padStart(2, "0");
    let ss = String(s).padStart(2, "0");

    return `${h}:${mm}:${ss}`;
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    // TODO: Implement this function
    function timeToSeconds(timeStr) {
        timeStr = timeStr.trim();
        let parts = timeStr.split(":");

        let h = parseInt(parts[0]);
        let m = parseInt(parts[1]);
        let s = parseInt(parts[2]);

        return h * 3600 + m * 60 + s;
    }

    let activeSec = timeToSeconds(activeTime);

    let d = date.trim().split("-");
    let year = parseInt(d[0]);
    let month = parseInt(d[1]);
    let day = parseInt(d[2]);

    let quotaSec;

    // Eid period: April 10–30, 2025
    if (year === 2025 && month === 4 && day >= 10 && day <= 30) {
        quotaSec = 6 * 3600;
    } else {
        quotaSec = (8 * 3600) + (24 * 60);
    }

    return activeSec >= quotaSec;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function
    const fs = require("fs");

    let content = fs.readFileSync(textFile, "utf8").trim();
    let lines = content.length ? content.split("\n") : [];

    // check duplicate
    for (let line of lines) {
        let cols = line.split(",");
        let id = cols[0];
        let date = cols[2];

        if (id === shiftObj.driverID && date === shiftObj.date) {
            return {};
        }
    }

    function timeToSeconds(timeStr) {
        timeStr = timeStr.trim().toLowerCase();
        let parts = timeStr.split(" ");
        let time = parts[0];
        let period = parts[1];

        let t = time.split(":");
        let h = parseInt(t[0]);
        let m = parseInt(t[1]);
        let s = parseInt(t[2]);

        if (period === "pm" && h !== 12) h += 12;
        if (period === "am" && h === 12) h = 0;

        return h * 3600 + m * 60 + s;
    }

    function secondsToTime(sec) {
        let h = Math.floor(sec / 3600);
        let m = Math.floor((sec % 3600) / 60);
        let s = sec % 60;

        let mm = String(m).padStart(2, "0");
        let ss = String(s).padStart(2, "0");

        return `${h}:${mm}:${ss}`;
    }

    // calculate shiftDuration
    let startSec = timeToSeconds(shiftObj.startTime);
    let endSec = timeToSeconds(shiftObj.endTime);
    let shiftDuration = secondsToTime(Math.max(0, endSec - startSec));

    // calculate idleTime
    let deliveryStart = 8 * 3600;
    let deliveryEnd = 22 * 3600;

    let idle = 0;

    if (startSec < deliveryStart) {
        idle += Math.min(endSec, deliveryStart) - startSec;
    }

    if (endSec > deliveryEnd) {
        idle += endSec - Math.max(startSec, deliveryEnd);
    }

    let idleTime = secondsToTime(idle);

    // calculate activeTime
    let activeTime = secondsToTime(Math.max(0, (endSec - startSec) - idle));

    // metQuota
    let d = shiftObj.date.split("-");
    let year = parseInt(d[0]);
    let month = parseInt(d[1]);
    let day = parseInt(d[2]);

    let activeSec = timeToSeconds(activeTime);
    let quota;

    if (year === 2025 && month === 4 && day >= 10 && day <= 30) {
        quota = 6 * 3600;
    } else {
        quota = (8 * 3600) + (24 * 60);
    }

    let metQuotaValue = activeSec >= quota;

    let newObj = {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: metQuotaValue,
        hasBonus: false
    };

    let newLine = [
        newObj.driverID,
        newObj.driverName,
        newObj.date,
        newObj.startTime,
        newObj.endTime,
        newObj.shiftDuration,
        newObj.idleTime,
        newObj.activeTime,
        newObj.metQuota,
        newObj.hasBonus
    ].join(",");

    // find insertion index
    let insertIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        let cols = lines[i].split(",");
        if (cols[0] === shiftObj.driverID) {
            insertIndex = i;
        }
    }

    if (insertIndex === -1) {
        lines.push(newLine);
    } else {
        lines.splice(insertIndex + 1, 0, newLine);
    }

    fs.writeFileSync(textFile, lines.join("\n"));

    return newObj;
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
    const fs = require("fs");

    let content = fs.readFileSync(textFile, "utf8").trim();

    if (content.length === 0) {
        return;
    }

    let lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {

        let cols = lines[i].split(",");

        if (cols[0] === driverID && cols[2] === date) {
            cols[9] = String(newValue);
            lines[i] = cols.join(",");
            break;
        }
    }

    fs.writeFileSync(textFile, lines.join("\n"));
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
     const fs = require("fs");

    let content = fs.readFileSync(textFile, "utf8").trim();

    if (content.length === 0) {
        return -1;
    }

    let lines = content.split("\n");

    let targetMonth = parseInt(month);

    let driverFound = false;
    let count = 0;

    for (let line of lines) {

        let cols = line.split(",");

        let id = cols[0].trim();
        let date = cols[2].trim();
        let hasBonus = cols[9].trim();

        if (id === driverID) {

            driverFound = true;

            let parts = date.split("-");
            let recordMonth = parseInt(parts[1]);

            if (recordMonth === targetMonth && hasBonus === "true") {
                count++;
            }
        }
    }

    if (!driverFound) {
        return -1;
    }

    return count;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
     const fs = require("fs");

    let content = fs.readFileSync(textFile, "utf8").trim();

    if (content.length === 0) {
        return "0:00:00";
    }

    let lines = content.split("\n");

    let targetMonth = parseInt(month);

    function timeToSeconds(timeStr) {
        let parts = timeStr.trim().split(":");
        let h = parseInt(parts[0]);
        let m = parseInt(parts[1]);
        let s = parseInt(parts[2]);

        return h * 3600 + m * 60 + s;
    }

    function secondsToTime(sec) {
        let h = Math.floor(sec / 3600);
        let m = Math.floor((sec % 3600) / 60);
        let s = sec % 60;

        let mm = String(m).padStart(2, "0");
        let ss = String(s).padStart(2, "0");

        return `${h}:${mm}:${ss}`;
    }

    let totalSeconds = 0;

    for (let line of lines) {

        let cols = line.split(",");

        let id = cols[0];
        let date = cols[2];
        let activeTime = cols[7];

        if (id === driverID) {

            let parts = date.split("-");
            let recordMonth = parseInt(parts[1]);

            if (recordMonth === targetMonth) {
                totalSeconds += timeToSeconds(activeTime);
            }
        }
    }

    return secondsToTime(totalSeconds);
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
      const fs = require("fs");

    let shiftsContent = fs.readFileSync(textFile, "utf8").trim();
    let ratesContent = fs.readFileSync(rateFile, "utf8").trim();

    if (ratesContent.length === 0) {
        return "0:00:00";
    }

    let rateLines = ratesContent.split("\n");

    let dayOff = null;

    for (let line of rateLines) {
        let cols = line.split(",");
        if (cols[0] === driverID) {
            dayOff = cols[1].trim();
            break;
        }
    }

    if (!dayOff) {
        return "0:00:00";
    }

    if (shiftsContent.length === 0) {
        return "0:00:00";
    }

    let lines = shiftsContent.split("\n");

    let targetMonth = parseInt(month);

    let totalSeconds = 0;

    function dayName(dateStr) {
        let d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-US", { weekday: "long" });
    }

    for (let line of lines) {

        let cols = line.split(",");

        let id = cols[0];
        let date = cols[2];

        if (id !== driverID) continue;

        let parts = date.split("-");
        let year = parseInt(parts[0]);
        let m = parseInt(parts[1]);
        let day = parseInt(parts[2]);

        if (m !== targetMonth) continue;

        let currentDayName = dayName(date);

        if (currentDayName === dayOff) continue;

        let quotaSeconds;

        if (year === 2025 && m === 4 && day >= 10 && day <= 30) {
            quotaSeconds = 6 * 3600;
        } else {
            quotaSeconds = (8 * 3600) + (24 * 60);
        }

        totalSeconds += quotaSeconds;
    }

    totalSeconds -= bonusCount * (2 * 3600);

    if (totalSeconds < 0) totalSeconds = 0;

    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = totalSeconds % 60;

    let mm = String(m).padStart(2, "0");
    let ss = String(s).padStart(2, "0");

    return `${h}:${mm}:${ss}`;





}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
      const fs = require("fs");

    function timeToSeconds(timeStr) {
        let parts = timeStr.trim().split(":");
        let h = parseInt(parts[0]);
        let m = parseInt(parts[1]);
        let s = parseInt(parts[2]);

        return h * 3600 + m * 60 + s;
    }

    let actualSec = timeToSeconds(actualHours);
    let requiredSec = timeToSeconds(requiredHours);

    let content = fs.readFileSync(rateFile, "utf8").trim();

    if (content.length === 0) {
        return 0;
    }

    let lines = content.split("\n");

    let basePay = 0;
    let tier = 0;

    for (let line of lines) {

        let cols = line.split(",");

        if (cols[0] === driverID) {
            basePay = parseInt(cols[2]);
            tier = parseInt(cols[3]);
            break;
        }
    }

    let allowedMissing = 0;

    if (tier === 1) allowedMissing = 50;
    else if (tier === 2) allowedMissing = 20;
    else if (tier === 3) allowedMissing = 10;
    else if (tier === 4) allowedMissing = 3;

    if (actualSec >= requiredSec) {
        return basePay;
    }

    let missingSeconds = requiredSec - actualSec;

    let missingHours = Math.floor(missingSeconds / 3600);

    let billableMissing = missingHours - allowedMissing;

    if (billableMissing < 0) billableMissing = 0;

    let deductionRatePerHour = Math.floor(basePay / 185);

    let salaryDeduction = billableMissing * deductionRatePerHour;

    let netPay = basePay - salaryDeduction;

    return netPay;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
