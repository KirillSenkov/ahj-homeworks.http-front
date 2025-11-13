import doRequest from './doRequest.js';

export default class Forms {
	// creates sinle ticket element from an object
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

	// creates the whole page outfit
	static async makeView() {
		const panelHeader = document.createElement('div');
		const panel = document.createElement('div');
		const addBtn = document.createElement('button');
		const ticketsList = document.createElement('ul');
		const allTickets = await doRequest('allTickets');

		panelHeader.className = 'panel__header';
		panel.className = 'panel';
		ticketsList.className = 'tickets';
		addBtn.className = 'ticket__add';
		addBtn.textContent = 'Добавить тикет';

		addBtn.addEventListener('click', Forms.useTicketAddOrEditForm);

		panel.append(addBtn, ticketsList);

		for (const item of allTickets) {
			const ticketLiElt = Forms.makeTicketLiElt(item);

			ticketsList.append(ticketLiElt);
		}

		document.body.append(panelHeader, panel);
	}

	// reload just tickets list
	static async refreshList() {
		const allTickets = await doRequest('allTickets');
		const ticketsListElt = document.body.querySelector('.panel')
			.querySelector('.tickets');

		ticketsListElt.replaceChildren();

		for (const item of allTickets) {
			const ticketLiElt = Forms.makeTicketLiElt(item);

			ticketsListElt.append(ticketLiElt);
		}
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
		let panel;

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

		if (event.currentTarget.className === 'ticket__add') {
			panel = event.currentTarget.parentElement;
		} else {
			panel = event.currentTarget.parentElement.parentElement;
		}

		panel.append(addOrEditForm);
	}

	// using of the add/edit ticket form if it exits allready OR NOT
	static async useTicketAddOrEditForm(event) {
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
				const data = await doRequest('ticketById', { id: ticketID });

				addOrEditForm.dataset.id = ticketID;
				description.value = data.description;
			}
		}
	}

	// returns an element for adding/editing a ticket
	static getTicketAddOrEditFormElt(currentTarget) {
		return currentTarget.closest('.panel').querySelector('.add_or_edit_form');
	}

	// guess what
	static async addTicket(event) {
		if (event.currentTarget.dataset.action !== 'add') return;

		const newTicketFormElt = Forms.getTicketAddOrEditFormElt(event.currentTarget);
		const name = newTicketFormElt.children[2].value.trim();
		const body = new FormData();

		if (!name) {
			alert('Тикет с пустым кратким описанием не может быть сохранён');
			return;
		}

		body.append('name', name);
		body.append('description', newTicketFormElt.children[4].value);
		await doRequest('createTicket', body);
		newTicketFormElt.classList.add('disabled');

		Forms.refreshList();
	}

	// i wonder what`s the function doeing
	static async editTicket(event) {
		if (event.currentTarget.dataset.action !== 'edit') return;

		const editTicketFormElt = Forms.getTicketAddOrEditFormElt(event.currentTarget);
		const name = editTicketFormElt.children[2].value.trim();
		const body = new FormData();

		if (!name) {
			alert('Тикет с пустым кратким описанием не может быть сохранён');
			return;
		}

		body.append('id', editTicketFormElt.dataset.id);
		body.append('name', name);
		body.append('description', editTicketFormElt.children[4].value);
		await doRequest('updateById', body);
		editTicketFormElt.classList.add('disabled');
		Forms.refreshList();
	}

	// for using from the deletion warning modal window
	static async deleteTicket(event) {
		const warnWindow = event.currentTarget.parentElement.parentElement;

		await doRequest('deleteById', { id: warnWindow.dataset.id });
		warnWindow.classList.add('disabled');
		Forms.refreshList();
	}

	// changes a ticket status
	static async toggleStatus(event) {
		const toggleStatusBtn = event.currentTarget;
		const ticketID = toggleStatusBtn.parentElement.dataset.id;
		const isChecked = toggleStatusBtn.dataset.checked === 'true';

		if (toggleStatusBtn.dataset.hold === 'true') {
			alert('Wait a second. Don\'t be so hasty.');
			return;
		}

		toggleStatusBtn.dataset.hold = 'true';
		await doRequest('toggleStatus', { id: ticketID });
		toggleStatusBtn.dataset.checked = String(!isChecked);
		toggleStatusBtn.dataset.hold = 'false';
	}

	// hides all descriptions
	static hideAllDescriptions(ticketsList) {
		const allActiveDescriptions = ticketsList.querySelectorAll('.ticket__description.active');

		for (const descr of allActiveDescriptions) descr.classList.remove('active');
	}

	// shows/hides description for a single ticket of the whole list
	static async showDescription(event) {
		if (event.target.tagName === 'BUTTON') return;

		const ticket = event.currentTarget;
		const description = ticket.querySelector('.ticket__description');

		if (description && description.classList.contains('active')) {
			description.classList.remove('active');
			return;
		}

		Forms.hideAllDescriptions(ticket.parentElement);

		if (description) {
			description.classList.add('active');
			return;
		}

		const data = await doRequest('ticketById', { id: ticket.dataset.id });
		const newDescription = document.createElement('span');

		newDescription.classList = 'ticket__description active';
		newDescription.textContent = data.description;
		ticket.append(newDescription);
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
