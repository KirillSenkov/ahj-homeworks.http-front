function getReqType(method) {
	let requestType;

	switch (method) {
	case 'allTickets':
		requestType = 'GET';
		break;
	case 'ticketById':
		requestType = 'GET';
		break;
	case 'createTicket':
		requestType = 'POST';
		break;
	case 'updateById':
		requestType = 'PATCH';
		break;
	case 'deleteById':
		requestType = 'DELETE';
		break;
	case 'toggleStatus':
		requestType = 'PATCH';
		break;
	default:
		requestType = 'GET';
	}

	return requestType;
}

function getURL(method, id) {
	const rootURL = 'http://localhost:7070';
	let params;

	switch (method) {
	case 'allTickets':
		params = '?method=allTickets';
		break;
	case 'ticketById':
		params = `?method=ticketById&id=${id}`;
		break;
	case 'createTicket':
		params = '';
		break;
	case 'updateById':
		params = `?method=updateById&id=${id}`;
		break;
	case 'deleteById':
		params = `?method=deleteById&id=${id}`;
		break;
	case 'toggleStatus':
		params = `?method=toggleStatus&id=${id}`;
		break;
	default:
		params = '';
	}

	return `${rootURL}${params}`;
}

function doRequest(method, data = {}) {
	const id = data instanceof FormData ? data.get('id') : data?.id;
	const requestType = getReqType(method);
	const url = getURL(method, id);

	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.open(requestType, url);

		xhr.addEventListener('load', () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					const parsed = JSON.parse(xhr.responseText);
					resolve(parsed);
				} catch (e) {
					if (xhr.responseText !== 'OK') {
						console.error('Не JSON:', e);
					}

					resolve(null);
				}
			} else {
				console.dir(xhr);
				reject(new Error(`HTTP ${xhr.status}`));
			}
		});

		xhr.addEventListener('error', () => reject(new Error('Ошибка выполнения запроса')));

		xhr.send(data);
	});
}

export default doRequest;
