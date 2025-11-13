(() => {
	class e {
		static makeTicketLiElt(t) { const a = document.createElement('li'); const n = document.createElement('button'); const r = document.createElement('span'); const s = document.createElement('time'); const c = document.createElement('button'); const d = document.createElement('button'); return a.className = 'ticket', n.className = 'ticket__toggle', r.className = 'ticket__title', s.className = 'ticket__date', c.className = 'ticket__edit', d.className = 'ticket__delete', n.dataset.checked = String(t.status), n.addEventListener('click', e.toggleStatus), a.dataset.id = t.id, a.addEventListener('click', e.showDescription), c.addEventListener('click', e.useTicketAddOrEditForm), d.addEventListener('click', e.showDelWarnWindow), r.textContent = t.name, s.textContent = e.formatTimestamp(t.created), a.append(n, r, s, c, d), a; }

		static makeView(t) { const a = document.createElement('div'); const n = document.createElement('div'); const r = document.createElement('button'); const s = document.createElement('ul'); a.className = 'panel__header', n.className = 'panel', s.className = 'tickets', r.className = 'ticket__add', r.textContent = 'Добавить тикет', r.addEventListener('click', e.useTicketAddOrEditForm), n.append(r, s); for (const a of t) { const t = e.makeTicketLiElt(a); s.append(t); }document.body.append(a, n); }

		static refreshList() { const t = new XMLHttpRequest(); t.open('GET', 'http://localhost:7070?method=allTickets'), t.addEventListener('load', () => { if (t.status >= 200 && t.status < 300) { let a; try { a = JSON.parse(t.responseText); } catch (e) { return console.error('Не JSON:', e); } const n = document.body.querySelector('.panel').querySelector('.tickets'); n.replaceChildren(); for (const t of a) { const a = e.makeTicketLiElt(t); n.insertAdjacentElement('beforeend', a); } } }), t.send(); }

		static makeTicketAddOrEditForm(t) { const a = document.createElement('div'); const n = document.createElement('label'); const r = document.createElement('label'); const s = document.createElement('input'); const c = document.createElement('label'); const d = document.createElement('textarea'); const i = document.createElement('div'); const o = document.createElement('button'); const l = document.createElement('button'); let m; o.className = 'confirm', r.textContent = 'Краткое описание', s.placeholder = 'Введите краткое описание', c.textContent = 'Подробное описание', d.placeholder = 'Введите подробное описение', l.textContent = 'Отмена', o.textContent = 'Ок', l.addEventListener('click', () => { a.classList.add('disabled'); }), o.addEventListener('click', e.addTicket), o.addEventListener('click', e.editTicket), i.className = 'btn_group', i.append(l, o), a.className = 'add_or_edit_form', a.append(n, r, s, c, d, i), m = t.currentTarget.className === 'ticket__add' ? t.currentTarget.parentElement : t.currentTarget.parentElement.parentElement, m.append(a); }

		static useTicketAddOrEditForm(t) {
			let a = e.getTicketAddOrEditFormElt(t.currentTarget); if (a) { if (!a.classList.contains('disabled')) return; a.classList.remove('disabled'); } else e.makeTicketAddOrEditForm(t), a = e.getTicketAddOrEditFormElt(t.currentTarget); const n = a.children[0]; const r = a.children[2]; const s = a.children[4]; const c = a.children[5].children[1]; if (t.currentTarget.className === 'ticket__add')n.textContent = 'Добавить тикет', c.dataset.action = 'add', r.value = '', s.value = ''; else {
				const e = t.currentTarget.parentElement.dataset.id; if (n.textContent = 'Изменить тикет', c.dataset.action = 'edit', r.value = t.currentTarget.parentElement.querySelector('.ticket__title').textContent, t.currentTarget.parentElement.querySelector('.ticket__description'))s.value = t.currentTarget.parentElement.querySelector('.ticket__description').textContent, a.dataset.id = e; else {
					const t = new XMLHttpRequest(); const
						n = new URL('http://localhost:7070'); a.dataset.id = e, n.searchParams.set('method', 'ticketById'), n.searchParams.set('id', e), t.open('GET', n.toString()), t.addEventListener('load', () => { if (t.status >= 200 && t.status < 300) { let e; try { e = JSON.parse(t.responseText); } catch (e) { console.log(`xhr.responseText: >${t.responseText}<`), console.error(`Не JSON: >${e}<`); }s.value = e.description; } }), t.send();
				}
			}
		}

		static getTicketAddOrEditFormElt(e) { return e.closest('.panel').querySelector('.add_or_edit_form'); }

		static addTicket(t) { if (t.currentTarget.dataset.action !== 'add') return; const a = e.getTicketAddOrEditFormElt(t.currentTarget); const n = new FormData(); const r = new XMLHttpRequest(); n.append('name', a.children[2].value), n.append('description', a.children[4].value), r.onreadystatechange = function () { r.readyState === 4 && (a.classList.add('disabled'), e.refreshList()); }, r.open('POST', 'http://localhost:7070'), r.send(n); }

		static editTicket(t) { if (t.currentTarget.dataset.action !== 'edit') return; const a = e.getTicketAddOrEditFormElt(t.currentTarget); const n = new FormData(); const r = new XMLHttpRequest(); const s = new URL('http://localhost:7070'); s.searchParams.set('method', 'updateById'), s.searchParams.set('id', a.dataset.id), n.append('name', a.children[2].value), n.append('description', a.children[4].value), r.onreadystatechange = function () { r.readyState === 4 && (a.classList.add('disabled'), e.refreshList()); }, r.open('PATCH', s), r.send(n); }

		static deleteTicket(t) { const a = t.currentTarget.parentElement.parentElement; const n = a.dataset.id; const r = new FormData(); const s = new XMLHttpRequest(); const c = new URL('http://localhost:7070'); c.searchParams.set('method', 'deleteById'), c.searchParams.set('id', n), r.append('superSecretPassword', 'QWERTY'), s.onreadystatechange = function () { s.readyState === 4 && s.status === 204 && (a.classList.add('disabled'), e.refreshList()); }, s.open('DELETE', c), s.send(r); }

		static toggleStatus(e) {
			const t = e.currentTarget; if (t.dataset.hold === 'true') return void alert("Wait a second. Don't be so hasty."); t.dataset.hold = 'true'; const a = new XMLHttpRequest(); const
				n = e.currentTarget.parentElement.dataset.id; a.open('PATCH', `http://localhost:7070?method=toggleStatus&id=${n}`), a.addEventListener('load', () => { if (a.status >= 200 && a.status < 300) { const e = t.dataset.checked === 'true'; t.dataset.checked = String(!e), t.dataset.hold = 'false'; } }), a.send();
		}

		static showDescription(e) { if (e.target.tagName === 'BUTTON') return; const t = e.currentTarget.querySelector('.ticket__description'); if (t && t.classList.contains('active')) return; const a = e.currentTarget.parentElement.querySelectorAll('.ticket__description.active'); for (const e of a)e.classList.remove('active'); if (t) return void t.classList.add('active'); const n = e.currentTarget; const r = new XMLHttpRequest(); const s = new URL('http://localhost:7070'); s.searchParams.set('method', 'ticketById'), s.searchParams.set('id', e.currentTarget.dataset.id), r.open('GET', s.toString()), r.addEventListener('load', () => { if (r.status >= 200 && r.status < 300) { let e; try { e = JSON.parse(r.responseText); } catch (e) { console.log(`xhr.responseText: >${r.responseText}<`), console.error(`Не JSON: >${e}<`); } const t = document.createElement('span'); t.classList = 'ticket__description active', t.textContent = e.description, n.append(t); } }), r.send(); }

		static makeDelWarnWindow(t) { const a = t.currentTarget.closest('.panel'); const n = document.createElement('div'); const r = document.createElement('span'); const s = document.createElement('span'); const c = document.createElement('div'); const d = document.createElement('button'); const i = document.createElement('button'); r.textContent = 'Удалить тикет', s.textContent = 'Вы уверены, что хотите удалить тикет? Это действие необратимо.', d.textContent = 'Ок', i.textContent = 'Отмена', i.addEventListener('click', () => { n.classList.add('disabled'); }), d.addEventListener('click', e.deleteTicket), c.className = 'btn_group', c.append(i, d), n.className = 'del_warn_window', r.className = 'del_warn_title', n.append(r, s, c), a.append(n); }

		static showDelWarnWindow(t) { let a = t.currentTarget.closest('.panel').querySelector('.del_warn_window'); a || (e.makeDelWarnWindow(t), a = t.currentTarget.closest('.panel').querySelector('.del_warn_window')), a.dataset.id = t.currentTarget.parentElement.dataset.id, a.classList.remove('disabled'); }

		static formatTimestamp(e) {
			return new Date(e).toLocaleString('ru-RU', {
				day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: !1,
			}).replace(',', '');
		}
	} const t = new XMLHttpRequest(); t.open('GET', 'http://localhost:7070?method=allTickets'), t.addEventListener('load', () => { if (t.status >= 200 && t.status < 300) { let a; try { a = JSON.parse(t.responseText); } catch (e) { return console.error('Не JSON:', e); }e.makeView(a); } }), t.send();
})();
