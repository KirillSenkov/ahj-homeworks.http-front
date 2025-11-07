import Forms from './Forms.js';
import '../css/style.css';

const xhr = new XMLHttpRequest();

xhr.open('GET', 'http://localhost:7070?method=allTickets');

xhr.addEventListener('load', () => {
	if (xhr.status >= 200 && xhr.status < 300) {
		let data;
		try {
			data = JSON.parse(xhr.responseText);
		} catch (e) {
			return console.error('Не JSON:', e);
		}

		Forms.makeView(data);
	}
});

xhr.send();
