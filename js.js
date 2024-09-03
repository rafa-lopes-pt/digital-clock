//========= ELEMENTS
const hourGrid = document.getElementById("hoursGrid");
const minuteGrid = document.getElementById("minutesGrid");
const secondsGrid = document.getElementById("secondsGrid");
//

function createArray(length, { step = 1, fillCountBetween, fill = true } = {}) {
	const arr = [];
	if (!fillCountBetween) fillCountBetween = step - 1;
	for (let i = 0; i < length; i = i + step) {
		arr.push(i.toString());
		for (let j = 0; j < fillCountBetween; j++) {
			if (fill) arr.push(".");
		}
	}
	return arr;
}

function insertTimeGrid2(element, gridArr) {
	for (let i in gridArr) {
		element.innerHTML += `
            <div class="time-grid__cell time-grid__cell--${i}" >
                    ${gridArr[i]}
                </div>`;
	}
}

const hArr = createArray(12, { fillCountBetween: 4 });
hArr[0] = "12";
const mArr = createArray(60, { step: 5 });
const sArr = createArray(60, { fill: false });

insertTimeGrid2(hourGrid, hArr);
insertTimeGrid2(minuteGrid, mArr);
insertTimeGrid2(secondsGrid, sArr);

const time = new Date();

function findNearest(arr, target) {
	let nearest = arr[0];
	let minDiff = Math.abs(target - nearest);

	for (const num of arr) {
		const diff = Math.abs(target - num);
		if (diff < minDiff) {
			minDiff = diff;
			nearest = num;
		}
	}

	return +nearest;
}
const parseToMeridian = (h) => (h > 12 ? h - 12 : h);
function calcTimeAngle(time = new Date(), arr) {
	/*
    //ex 6:32:27
    s->m->h
    sAng = sArr.indexOf(27) -> Too much work... ?
    mAng = mArr.findNearest(32) //+Math.ceil(27/60*5)

    */
	const getAngleByIndex = (arrLen, i) => (360 / arrLen) * i;
	//========================= STEP: SECONDS
	const s = time.getSeconds();
	const sAngle = getAngleByIndex(sArr.length, s);

	//========================= STEP: MINUTES
	const m = time.getMinutes();
	//CompoundAngle m + s
	const compoundAngle_sm = s / 10; //Each minute slice = 6deg
	const mAngle = getAngleByIndex(mArr.length, m) + compoundAngle_sm;

	//========================= STEP: HOURS
	const h = parseToMeridian(time.getHours());
	const compoundAngle_mh = (5 * 6 * m) / 60; //Each hour slice = 6deg * 5
	const hAngle = getAngleByIndex(12, h) + compoundAngle_mh;

	return { h: hAngle, m: mAngle, s: sAngle };
}

const { h, m, s } = calcTimeAngle(new Date());

hourGrid.style.setProperty("--angle", -1 * h + "deg");
minuteGrid.style.setProperty("--angle", -1 * m + "deg");
secondsGrid.style.setProperty("--angle", -1 * s + "deg");

let animationID = null;

function animate() {
	const h = new Date().getHours(),
		m = new Date().getMinutes(),
		s = new Date().getSeconds();
	//OUTER RING RGB COLOR CHANGE
	document.querySelector(".clock").style.setProperty("--hue", s * 6);

	//HIGHLIGHT CURRENT TIME
	const toDoubleDigit = (d) => (d < 10 ? "0" + d : d);
	const marker = document.querySelector(".marker");

	marker.innerHTML = "";
	marker.innerHTML = `<span>
        ${toDoubleDigit(parseToMeridian(h))} : ${toDoubleDigit(
		m
	)} : ${toDoubleDigit(s)} <span class="marker__ampm">${
		h > 12 ? "PM" : "AM"
	}</span></span>`;

	animationID = requestAnimationFrame(animate);
}
animate();

function forceElementReload(id) {
	const element = document.querySelector(id);
	const clonedElement = element.cloneNode(true);
	element.parentNode.replaceChild(clonedElement, element);
	if (id.charAt(0) === ".") {
		clonedElement.classList.add(id.substring(1, id.length));
	}
}

function replayAnimation() {
	//Cancel prev animation, and then cleanup the el
	cancelAnimationFrame(animationID);
	forceElementReload(".clock");
	//Do the same with btn
	forceElementReload("#replay");

	animate();
}
