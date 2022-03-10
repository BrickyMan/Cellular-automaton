let doc = document.documentElement,
	nextBtn = document.querySelector('#next'),
	playBtn = document.querySelector('#play'),
	pauseBtn = document.querySelector('#pause'),
	clearBtn = document.querySelector('#clear'),
	randBtn = document.querySelector('#random'),
	menuBtn = document.querySelector('#menu'),
	settings = document.querySelector('#settings'),
	speedSlider = document.querySelector('#speed-slider'),
	densitySlider = document.querySelector('#density-slider'),
	neumannImg = document.querySelector('#neumann-img'),
	mooreImg = document.querySelector('#moore-img'),
	neighbsTypeSwitch = document.querySelector('#neighbs-type-switch'),
	neighbsButtons_MooreOnly = document.querySelectorAll('.moore-only'),
	neighbsToLiveButtons = document.querySelectorAll('.neighbors-list-to-live .neighbors-unit'),
	neighbsToBornButtons = document.querySelectorAll('.neighbors-list-to-born .neighbors-unit'),
	can = document.querySelector('#can'),
	ctx = can.getContext('2d'),
	iterationSpeed = speedSlider.value,
	density = densitySlider.value,
	cellSize = 15,
	columns = Math.floor(doc.clientWidth / cellSize),
	rows = Math.floor((doc.clientHeight - 55) / cellSize),
	cellNumsToBorn = [3],
	cellNumsToLive = [2, 3],
	area = [],
	newArea = [],
	neighbsToBornChoose,
	neighbsToLiveChoose,
	zeroX,
	zeroY,
	clickX,
	clickY,
	clickedCellX,
	clickedCellY,
	checkNeighbColumn,
	checkNeighbRow;

// console.log(cellNumsToBorn, cellNumsToLive);

menuBtn.onclick = () => {
	settings.classList.toggle('settings-hidden');
	menuBtn.classList.toggle('menu-off');
	menuBtn.classList.toggle('menu-on');
}

speedSlider.onchange = function() {
	iterationSpeed = this.value;
}

densitySlider.onchange = function() {
	density = this.value;
}

neighbsTypeSwitch.checked = false;

neighbsTypeSwitch.onclick = function() {
	mooreImg.classList.toggle('neighborhood-switch_img-off');
	neumannImg.classList.toggle('neighborhood-switch_img-off');
	neighbsButtons_MooreOnly.forEach((elem) => {
		elem.classList.toggle('neighbors-unit_disabled');
	});
}

neighbsToBornButtons.forEach((elem) => {
	elem.onclick = () => {
		elem.classList.toggle('neighbors-unit_checked');
		cellNumsToBorn = makeListOfNumCells(neighbsToBornButtons);
		// console.log(cellNumsToBorn);
	}
});

neighbsToLiveButtons.forEach((elem) => {
	elem.onclick = () => {
		elem.classList.toggle('neighbors-unit_checked');
		cellNumsToLive = makeListOfNumCells(neighbsToLiveButtons);
		// console.log(cellNumsToLive);
	}
});

function makeListOfNumCells(list) {
	let cellsList = [];
	list.forEach((listElem) => {
		if (listElem.classList.contains('neighbors-unit_checked') && !listElem.classList.contains('neighbors-unit_disabled')) {
			cellsList.push(Number(listElem.innerHTML));
		}
	});
	return cellsList;
}

// Задание размеров поля
can.width = columns * cellSize;
can.height = rows * cellSize;

// Получение нулевых координат
function getZeroCoordinates() {
	zeroX = Math.ceil((doc.clientWidth / 2) - (can.width / 2)),
	zeroY = Math.ceil(((doc.clientHeight + 55) / 2) - (can.height / 2));
}

// Создание матрицы
function createMatrix(matrix) {
	matrix = [];
	for(let i = 0; i < rows; i++) {
		matrix.push([]);
		for(let j = 0; j < columns; j++) {
			matrix[i].push(0);
		}
	}
	return matrix;
}

area = createMatrix(area);
newArea = createMatrix(newArea);
drawField(area);

// Обработка нажатия на поле
can.onclick = () => {
	getZeroCoordinates();
	// Координаты клика
	clickX = event.clientX,
	clickY = event.clientY,
	// Расчёт координат клетки в матрице
	clickedCellX = Math.floor((clickX - zeroX) / cellSize),
	clickedCellY = Math.floor((clickY - zeroY) / cellSize);
	// Проверка состояния клетки и изменение на противоположное
	if (area[clickedCellY][clickedCellX] == 0) {
		area[clickedCellY][clickedCellX] = 1;
	}
	else if (area[clickedCellY][clickedCellX] == 1) {
		area[clickedCellY][clickedCellX] = 0;
	}
	drawField(area);
}

// Обновление поля 
function drawField(matrixToDraw) {
	// Очистка холста
	ctx.clearRect(0, 0, can.width, can.height);
	// Создание поля заново
	for(let i = 0; i < rows; i++)
	for(let j = 0; j < columns; j++) {
		if (matrixToDraw[i][j] == 0) {
			ctx.fillStyle = '#292929';
		}
		else if (matrixToDraw[i][j] == 1) {
			ctx.fillStyle = '#e9b610';
		}
		ctx.fillRect((j*cellSize)+1, (i*cellSize)+1, cellSize-2, cellSize-2);
	}
}

function iteration() {
	// console.log(cellNumsToBorn, cellNumsToLive);
	let countOfAliveCells = 0;
	for(let i = 0; i < rows; i++) 
	for(let j = 0; j < columns; j++) {
		if (area[i][j] == 1) {
			countOfAliveCells++;
		}
		let neighbors;
		neighbors = checkCellsNeighbors(i, j, neighbsTypeSwitch.checked);
		if (area[i][j] == 1 && cellNumsToLive.includes(neighbors)) {
			newArea[i][j] = 1;
			// console.log(area[i][j] + ' will born');
		}
		else if (area[i][j] == 0 && cellNumsToBorn.includes(neighbors)) {
			newArea[i][j] = 1;
			// console.log(i + ' ' + j + ' still live');
		}
	}
	if (countOfAliveCells == 0) {
		pauseBtn.classList.add('selected');
		playBtn.classList.remove('selected');
		clearTimeout(iterationTimer);
	}
	area = [];
	area = area.concat(newArea);
	drawField(area);
	newArea = createMatrix(newArea);
}

function checkCellsNeighbors(curRow, curCol, isNeumann) {
	let numNeighbs = 0;
	for(let r = -1; r <= 1; r++)
	for(let c = -1; c <= 1; c++) {
		if (!isNeumann || ((r == -1 && c == 0) || r == 0 || (r == 1 && c == 0))) {
			checkNeighbRow = curRow + r;
			if (checkNeighbRow < 0) {
				checkNeighbRow = rows - 1;
			}
			else if (checkNeighbRow >= rows) {
				checkNeighbRow = 0;
			}
			checkNeighbColumn = curCol + c;
			if (checkNeighbColumn < 0) {
				checkNeighbColumn = columns - 1;
			}
			else if (checkNeighbColumn >= columns) {
				checkNeighbColumn = 0;
			}
			// Проверка окружающих клеток на попадание в диапазон матрицы
			if (!(checkNeighbRow == curRow && checkNeighbColumn == curCol) && area[checkNeighbRow][checkNeighbColumn] == 1) {
				numNeighbs++;
			}
		}
	}
	return numNeighbs;
}

// Нажатие на кнопку запуска симуляции
playBtn.onclick = () => {
	if (!playBtn.classList.contains('selected')) {
		pauseBtn.classList.remove('selected');
		playBtn.classList.add('selected');
		if (!settings.classList.contains('settings-hidden')) {
			settings.classList.toggle('settings-hidden');
			menuBtn.classList.toggle('menu-off');
			menuBtn.classList.toggle('menu-on');
		}
		let iterationTimer = setTimeout(function getIterationTime() {
			iteration();
			pauseBtn.onclick = () => {
				pauseBtn.classList.add('selected');
				playBtn.classList.remove('selected');
				clearTimeout(iterationTimer);
			}
			iterationTimer = setTimeout(getIterationTime, iterationSpeed)
		}, iterationSpeed);
	}
}

nextBtn.onclick = iteration;

clearBtn.onclick = () => {
	area = [];
	newArea = [];
	area = createMatrix(area);
	newArea = createMatrix(newArea);
	drawField(area);
	pauseBtn.classList.add('selected');
	playBtn.classList.remove('selected');
}

randBtn.onclick = () => {
	area = [];
	area = createMatrix();
	for(let i = 0; i < rows; i++)
	for(let j = 0; j < columns; j++) {
		let randStatus = getRandom(0, density);
		if (randStatus < 1) {
			area[i][j] = 1;
		}
		else {
			area[i][j] = 0;
		}
	}
	drawField(area);
}

function getRandom(min, max) {
	return Math.floor(min + Math.random() * (max - min));
}