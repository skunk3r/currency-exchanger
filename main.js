let currencyIn = document.body.querySelector('#initial .currency');
let currencyOut = document.body.querySelector('#required .currency');
let activeMenu;
let rates = {};
let inputs = document.querySelectorAll('.amount');

function setBodyHeight() {
	let scrollHeight = Math.max(
		document.body.scrollHeight, document.documentElement.scrollHeight,
		document.body.offsetHeight, document.documentElement.offsetHeight,
		document.body.clientHeight, document.documentElement.clientHeight
	);

	document.body.style.height = scrollHeight + 'px';
}

setBodyHeight();

window.addEventListener('resize', setBodyHeight);

function select(li, dontShowMenu) {
	let selected = li.closest('.currency').querySelector('.selected');
	let dataValue = selected.dataset.value;
	let dataIndex = selected.dataset.index;
	let span = selected.querySelector('.text');
	let liSpan = li.querySelector('.text');
	let text = span.innerHTML;

	selected.dataset.index = li.dataset.index;
	selected.dataset.value = li.dataset.value;
	span.innerHTML = liSpan.innerHTML;
	liSpan.innerHTML = text;
	li.dataset.value = dataValue;
	li.dataset.index = dataIndex;

	if (!dontShowMenu) showMenu.call(selected);
	convert.call(document.querySelector('.amount.in'));
	showRate();
	sort(li.closest('ul'))
}

function sort(ul) {
	let arr = [];
	let lis = ul.querySelectorAll('li');

	for (let li of lis) {
		arr.push(li);
	}

	for (let i = 0; i < arr.length - 1; i++) {
		if (arr[i].dataset.index > arr[i+1].dataset.index) {
			let span = arr[i].querySelector('.text');
			let text = span.textContent;
			let value = arr[i].dataset.value;
			let index = arr[i].dataset.index;

			arr[i].dataset.index = arr[i+1].dataset.index;
			arr[i].dataset.value = arr[i+1].dataset.value;
			span.innerHTML = arr[i+1].querySelector('.text').innerHTML;
			arr[i+1].querySelector('.text').innerHTML = text;
			arr[i+1].dataset.index = index;
			arr[i+1].dataset.value = value;
		}
	}
}

currencyIn.onpointerdown = () => false;
currencyOut.onpointerdown = () => false;

function handler() {
	if (event.code === 'KeyE' ||
		event.key === '-' ||
		event.key === '+' ||
		event.key === '.') event.preventDefault();
}

for (let input of inputs) {
	input.addEventListener('input', () => convert.call(input));
	input.addEventListener('focus', () => {
		input.closest('div').classList.add('active');
	});
	input.addEventListener('blur', () => {
		input.closest('div').classList.remove('active');
	});
	input.addEventListener('keydown', handler);
}

function showMenu() {
	let arrow = this.querySelector('.arrow');
	let sub = arrow.closest('.currency').querySelector('.sub');

	this.classList.toggle('active');
	arrow.classList.toggle('active');
	sub.classList.toggle('active');
}

document.body.onclick = function(event) {
	let menu = event.target.matches('.selected')? event.target: 
		event.target.closest('.selected')? event.target.closest('.selected'): null;
	let li = null;
	let focusedInput = document.querySelector('.input-wrapper.active')

	if (activeMenu) {
		li = event.target.tagName === 'LI'? event.target:
		event.target.closest('li')? event.target.closest('li'): null;
	}

	if (focusedInput && (event.target != focusedInput && event.target != focusedInput.firstElementChild)) {
		focusedInput.firstElementChild.blur();
	}

	if (!menu && !activeMenu) return;

	if (li) {
		select(li);
		activeMenu = null;
		return;
	}

	if (menu) {
		if (activeMenu && activeMenu != menu) {
			showMenu.call(activeMenu);
			showMenu.call(menu);
			activeMenu = menu;
		} else if (activeMenu == menu) {
			showMenu.call(menu);
			activeMenu = null;
		} else {
			showMenu.call(menu);
			activeMenu = menu;
		}
	} else {
		showMenu.call(activeMenu);
		activeMenu = null;
	}
}

document.body.querySelector('#swap').onclick = function swap(event) {
	let selectedIn = currencyIn.querySelector('.selected').dataset.index;
	let selectedOut = currencyOut.querySelector('.selected').dataset.index;

	select(currencyIn.querySelector(`[data-index = "${selectedOut}"]`), true);
	select(currencyOut.querySelector(`[data-index = "${selectedIn}"]`), true);
}

function convert() {
	let inputIn = this;
	let currencyIn = this.closest('div.block').querySelector('.selected').dataset.value.toUpperCase();
	let inputOut, currencyOut

	for (let input of inputs) {
		if (input != this) {
			inputOut = input;
			currencyOut = input.closest('div.block').querySelector('.selected').dataset.value.toUpperCase();
		}
	}
	
	if (currencyIn === currencyOut) inputOut.value = inputIn.value
	else {
		let str = currencyIn + '_' + currencyOut;
		let strInvert = currencyOut + '_' + currencyIn;

		for (let prop in rates) {
			if (str == prop) {
				inputIn.value = selfEdit(inputIn.value);
				inputOut.value = editValue(inputIn.value * rates[prop]);
			} else if (strInvert == prop) {
				inputIn.value = selfEdit(inputIn.value);
				inputOut.value = editValue(inputIn.value / rates[prop]);
			}
		}
	}
}

function selfEdit(value) {
	if (value == 0) value = 0
	else if (value > 999999999) value = 999999999;
	if (parseInt(value) > 0) value = parseFloat(value);
	
	return value;
}

function editValue(value) {
	value = value.toFixed(2);
	if (value === 0) value = 0;

	return value;
}

function update() {
	for(let input of inputs) input.disabled = true;

	let p = document.querySelector('.current-rate');
	if (p) p.remove();

	let circle = document.createElement('div');
	let innerCircle = document.createElement('div');
	circle.id = 'circle';
	innerCircle.id = 'inner-circle';
	circle.append(innerCircle);

	let rate = document.querySelector('#rate');
	rate.append(circle);

	fetch('https://free.currconv.com/api/v7/convert?q=USD_RUB&compact=ultra&apiKey=407b7c99da0000f4a805')
	.then(response => response.json())
	.then(json => {console.log(json); for (let prop in json) rates[prop] = json[prop]})
	.then(fetch('https://free.currconv.com/api/v7/convert?q=EUR_RUB&compact=ultra&apiKey=407b7c99da0000f4a805')
		.then(response => response.json())
		.then(json => {console.log(json); for (let prop in json) rates[prop] = json[prop]})
		.then(fetch('https://free.currconv.com/api/v7/convert?q=USD_EUR&compact=ultra&apiKey=407b7c99da0000f4a805')
			.then(response => response.json())
			.then(json => {console.log(json); for (let prop in json) rates[prop] = json[prop]})
		)
	)
	.then(showRate)
	.catch(err => {
		for(let input of inputs) input.disabled = true;
		let p = document.querySelector('.current-rate');
		if (p) p.innerHTML += `: ${err.toLowerCase()}`;
		//return err
	})
}

function showRate() {
	let circle = document.querySelector('#circle');
	let rate = document.querySelector('#rate');
	let p = document.querySelector('.current-rate');
	let currencyIn = document.querySelector('#initial .selected').dataset.value.toUpperCase();
	let currencyOut = document.querySelector('#required .selected').dataset.value.toUpperCase();
	let str = currencyIn + '_' + currencyOut;
	let strInvert = currencyOut + '_' + currencyIn;

	if (circle) circle.remove();
	if (!p) {
		p = document.createElement('p');
		p.className = 'current-rate';
		rate.append(p);
	}

	if (rates[str]) p.innerHTML = `1 ${currencyIn} = ${rates[str].toFixed(3)} ${currencyOut}`
	else if (rates[strInvert]) p.innerHTML = `1 ${currencyIn} = ${(1/+rates[strInvert]).toFixed(3)} ${currencyOut}`
	else if (currencyIn === currencyOut) p.innerHTML = ''
	else p.innerHTML = 'error';

	if (p.innerHTML != 'error') for(let input of inputs) input.disabled = false;
}

update();

let interval = setInterval(update, 600000);