export default class Forms {
	// create sinle ticket element from an object
	static makeTicketLiElt(item) {
		const ticket = document.createElement('li');
		const status = document.createElement('button');
		const name = document.createElement('span');
		const created = document.createElement('time');
		const editBtn = document.createElement('button');
		const deleteBtn = document.createElement('button');

		ticket.className = 'ticket';
		status.className = 'ticket__toggle';
		name.className = 'ticket__title';
		created.className = 'ticket__date';
		editBtn.className = 'ticket__edit';
		deleteBtn.className = 'ticket__delete';

		status.dataset.checked = String(item.status);
		status.addEventListener('click', Forms.toggleStatus);

		ticket.dataset.id = item.id;
		ticket.addEventListener('click', Forms.showDescription);

		editBtn.addEventListener('click', Forms.useTicketAddOrEditForm);
		deleteBtn.addEventListener('click', Forms.showDelWarnWindow);

		name.textContent = item.name;
		created.textContent = Forms.formatTimestamp(item.created);

		ticket.append(
			status,
			name,
			created,
			editBtn,
			deleteBtn,
		);

		return ticket;
	}

	// create the whole page outfit
	static makeView(list) {
		const panelHeader = document.createElement('div');
		const panel = document.createElement('div');
		const addBtn = document.createElement('button');
		const ticketsList = document.createElement('ul');

		panelHeader.className = 'panel__header';
		panel.className = 'panel';
		ticketsList.className = 'tickets';
		addBtn.className = 'ticket__add';
		addBtn.textContent = 'Добавить тикет';

		addBtn.addEventListener('click', Forms.useTicketAddOrEditForm);

		panel.append(addBtn, ticketsList);

		for (const item of list) {
			const ticketLiElt = Forms.makeTicketLiElt(item);

			ticketsList.append(ticketLiElt);
		}

		document.body.append(panelHeader, panel);
	}

	// reload just tickets list
	static refreshList() {
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

				const ticketsListElt = document.body.querySelector('.panel')
					.querySelector('.tickets');

				ticketsListElt.replaceChildren();

				for (const item of data) {
					const ticketLiElt = Forms.makeTicketLiElt(item);

					ticketsListElt.insertAdjacentElement('beforeend', ticketLiElt);
				}
			}
		});

		xhr.send();
	}

	// creation of the add/edit ticket form
	static makeTicketAddOrEditForm(event) {
		const addOrEditForm = document.createElement('div');
		const labelTitle = document.createElement('label');
		const labelName = document.createElement('label');
		const name = document.createElement('input');
		const labelDescription = document.createElement('label');
		const description = document.createElement('textarea');
		const btnGroup = document.createElement('div');
		const okBtn = document.createElement('button');
		const cancelBtn = document.createElement('button');

		okBtn.className = 'confirm';

		labelName.textContent = 'Краткое описание';
		name.placeholder = 'Введите краткое описание';
		labelDescription.textContent = 'Подробное описание';
		description.placeholder = 'Введите подробное описение';
		cancelBtn.textContent = 'Отмена';
		okBtn.textContent = 'Ок';

		cancelBtn.addEventListener('click', () => {
			addOrEditForm.classList.add('disabled');
		});
		okBtn.addEventListener('click', Forms.addTicket);
		okBtn.addEventListener('click', Forms.editTicket);

		btnGroup.className = 'btn_group';
		btnGroup.append(cancelBtn, okBtn);

		addOrEditForm.className = 'add_or_edit_form';
		addOrEditForm.append(
			labelTitle,
			labelName,
			name,
			labelDescription,
			description,
			btnGroup,
		);

		let panel;

		if (event.currentTarget.className === 'ticket__add') {
			panel = event.currentTarget.parentElement;
		} else {
			panel = event.currentTarget.parentElement.parentElement;
		}

		panel.append(addOrEditForm);
	}

	// using of the add/edit ticket form if it exits allready OR NOT
	static useTicketAddOrEditForm(event) {
		let addOrEditForm = Forms.getTicketAddOrEditFormElt(event.currentTarget);

		if (!addOrEditForm) {
			Forms.makeTicketAddOrEditForm(event);
			addOrEditForm = Forms.getTicketAddOrEditFormElt(event.currentTarget);
		} else if (addOrEditForm.classList.contains('disabled')) {
			addOrEditForm.classList.remove('disabled');
		} else {
			return;
		}

		const labelTitle = addOrEditForm.children[0];
		const name = addOrEditForm.children[2];
		const description = addOrEditForm.children[4];
		const okBtn = addOrEditForm.children[5].children[1];

		if (event.currentTarget.className === 'ticket__add') {
			labelTitle.textContent = 'Добавить тикет';
			okBtn.dataset.action = 'add';
			name.value = '';
			description.value = '';
		} else {
			const ticketID = event.currentTarget.parentElement.dataset.id;

			labelTitle.textContent = 'Изменить тикет';
			okBtn.dataset.action = 'edit';
			name.value = event.currentTarget.parentElement
				.querySelector('.ticket__title').textContent;

			if (event.currentTarget.parentElement
				.querySelector('.ticket__description')) {
				description.value = event.currentTarget.parentElement
					.querySelector('.ticket__description').textContent;
				addOrEditForm.dataset.id = ticketID;
			} else {
				const xhr = new XMLHttpRequest();
				const url = new URL('http://localhost:7070');

				addOrEditForm.dataset.id = ticketID;

				url.searchParams.set('method', 'ticketById');
				url.searchParams.set('id', ticketID);
				xhr.open('GET', url.toString());

				xhr.addEventListener('load', () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						let data;
						try {
							data = JSON.parse(xhr.responseText);
						} catch (err) {
							console.log(`xhr.responseText: >${xhr.responseText}<`);
							console.error(`Не JSON: >${err}<`);
						}

						description.value = data.description;
					}
				});

				xhr.send();
			}
		}
	}

	// returns an element for adding/editing a ticket
	static getTicketAddOrEditFormElt(currentTarget) {
		return currentTarget.closest('.panel').querySelector('.add_or_edit_form');
	}

	// guess what
	static addTicket(event) {
		if (event.currentTarget.dataset.action !== 'add') return;

		const newTicketFormElt = Forms.getTicketAddOrEditFormElt(event.currentTarget);
		const body = new FormData();
		const xhr = new XMLHttpRequest();

		// here it is absolutely redundant. only ONE single possible POST-request is assumed.
		// const url = new URL('http://localhost:7070');
		// url.searchParams.set('method', 'createTicket');

		body.append('name', newTicketFormElt.children[2].value);
		body.append('description', newTicketFormElt.children[4].value);

		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) return;

			newTicketFormElt.classList.add('disabled');
			Forms.refreshList();
		};

		xhr.open('POST', 'http://localhost:7070');
		xhr.send(body);
	}

	// i wonder what the function`s doeing
	static editTicket(event) {
		if (event.currentTarget.dataset.action !== 'edit') return;

		const newTicketFormElt = Forms.getTicketAddOrEditFormElt(event.currentTarget);
		const body = new FormData();
		const xhr = new XMLHttpRequest();
		const url = new URL('http://localhost:7070');

		url.searchParams.set('method', 'updateById');
		url.searchParams.set('id', newTicketFormElt.dataset.id);

		body.append('name', newTicketFormElt.children[2].value);
		body.append('description', newTicketFormElt.children[4].value);

		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) return;
			newTicketFormElt.classList.add('disabled');
			Forms.refreshList();
		};

		xhr.open('PATCH', url);
		xhr.send(body);
	}

	// for using from the deletion warning modal window
	static deleteTicket(event) {
		const warnWindow = event.currentTarget.parentElement.parentElement;
		const ticketID = warnWindow.dataset.id;
		const body = new FormData();
		const xhr = new XMLHttpRequest();
		const url = new URL('http://localhost:7070');

		url.searchParams.set('method', 'deleteById');
		url.searchParams.set('id', ticketID);
		body.append('superSecretPassword', 'QWERTY');

		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) return;
			if (xhr.status === 204) {
				warnWindow.classList.add('disabled');
				Forms.refreshList();
			}
		};

		xhr.open('DELETE', url);
		xhr.send(body);
	}

	// changes a ticket status
	static toggleStatus(event) {
		const toggleStatusBtn = event.currentTarget;

		if (toggleStatusBtn.dataset.hold === 'true') {
			alert('Wait a second. Don\'t be so hasty.');
			return;
		}

		toggleStatusBtn.dataset.hold = 'true';

		const xhr = new XMLHttpRequest();
		const ticketID = event.currentTarget.parentElement.dataset.id;

		xhr.open('PATCH', `http://localhost:7070?method=toggleStatus&id=${ticketID}`);

		xhr.addEventListener('load', () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				const isChecked = toggleStatusBtn.dataset.checked === 'true';

				toggleStatusBtn.dataset.checked = String(!isChecked);
				toggleStatusBtn.dataset.hold = 'false';
			}
		});

		xhr.send();
	}

	// shows description for a single ticket of the whole list
	static showDescription(event) {
		if (event.target.tagName === 'BUTTON') return;

		const description = event.currentTarget.querySelector('.ticket__description');

		if (description && description.classList.contains('active')) return;

		const allActiveDescriptions = event.currentTarget.parentElement
			.querySelectorAll('.ticket__description.active');

		for (const descr of allActiveDescriptions) descr.classList.remove('active');

		if (description) {
			description.classList.add('active');
			return;
		}

		const ticket = event.currentTarget;
		const xhr = new XMLHttpRequest();
		const url = new URL('http://localhost:7070');

		url.searchParams.set('method', 'ticketById');
		url.searchParams.set('id', event.currentTarget.dataset.id);
		xhr.open('GET', url.toString());

		xhr.addEventListener('load', () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				let data;
				try {
					data = JSON.parse(xhr.responseText);
				} catch (err) {
					console.log(`xhr.responseText: >${xhr.responseText}<`);
					console.error(`Не JSON: >${err}<`);
				}

				const newDescription = document.createElement('span');
				newDescription.classList = 'ticket__description active';
				newDescription.textContent = data.description;
				ticket.append(newDescription);
			}
		});

		xhr.send();
	}

	// just creation of the deletion warning window element in the main panel
	static makeDelWarnWindow(event) {
		const panel = event.currentTarget.closest('.panel');
		const window = document.createElement('div');
		const title = document.createElement('span');
		const text = document.createElement('span');
		const btnGroup = document.createElement('div');
		const okBtn = document.createElement('button');
		const cancelBtn = document.createElement('button');

		title.textContent = 'Удалить тикет';
		text.textContent = 'Вы уверены, что хотите удалить тикет? Это действие необратимо.';
		okBtn.textContent = 'Ок';
		cancelBtn.textContent = 'Отмена';

		cancelBtn.addEventListener('click', () => {
			window.classList.add('disabled');
		});
		okBtn.addEventListener('click', Forms.deleteTicket);

		btnGroup.className = 'btn_group';
		btnGroup.append(cancelBtn, okBtn);

		window.className = 'del_warn_window';
		title.className = 'del_warn_title';
		window.append(title, text, btnGroup);
		panel.append(window);
	}

	// shows deletion warning window and marks it with current ticket ID
	static showDelWarnWindow(event) {
		let window = event.currentTarget.closest('.panel')
			.querySelector('.del_warn_window');

		if (!(window)) {
			Forms.makeDelWarnWindow(event);
			window = event.currentTarget.closest('.panel')
				.querySelector('.del_warn_window');
		}

		window.dataset.id = event.currentTarget.parentElement.dataset.id;
		window.classList.remove('disabled');
	}

	// makes readable date-time from a timestamp
	static formatTimestamp(timestamp) {
		const result = new Date(timestamp).toLocaleString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		});

		return result.replace(',', '');
	}
}
