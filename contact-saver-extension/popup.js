// popup.js
'use strict';

const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const contactForm = document.getElementById('contactForm');
const cancelBtn = document.getElementById('cancelBtn');
const contactsBody = document.getElementById('contactsBody');
const contactIdInput = document.getElementById('contactId');

const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const relationshipInput = document.getElementById('relationship');

document.addEventListener('DOMContentLoaded', renderContacts);
addBtn.addEventListener('click', openAddModal);
cancelBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
contactForm.addEventListener('submit', onSave);

function openAddModal() {
  contactIdInput.value = '';
  modalTitle.textContent = 'Add contact';
  nameInput.value = '';
  phoneInput.value = '';
  emailInput.value = '';
  relationshipInput.value = '';
  showModal();
}

function openEditModal(contact) {
  contactIdInput.value = contact.id;
  modalTitle.textContent = 'Edit contact';
  nameInput.value = contact.name || '';
  phoneInput.value = contact.phone || '';
  emailInput.value = contact.email || '';
  relationshipInput.value = contact.relationship || '';
  showModal();
}

function showModal(){
  modal.setAttribute('aria-hidden', 'false');
  // focus first field
  setTimeout(()=> nameInput.focus(), 50);
}

function closeModal(){
  modal.setAttribute('aria-hidden', 'true');
}

// Simple validators
function isValidPhone(p){
  if(!p) return false;
  // allow digits, spaces, +, -, parentheses
  return /^[0-9+\-().\s]{5,30}$/.test(p.trim());
}
function isValidEmail(e){
  if(!e) return true; // email optional
  // basic email pattern
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

function onSave(e){
  e.preventDefault();
  const id = contactIdInput.value || null;
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const relationship = relationshipInput.value.trim();

  if (!name) {
    alert('Please enter a name.');
    nameInput.focus();
    return;
  }
  if (!isValidPhone(phone)) {
    alert('Please enter a valid phone number (min 5 characters).');
    phoneInput.focus();
    return;
  }
  if (!isValidEmail(email)) {
    alert('Please enter a valid email address or leave it empty.');
    emailInput.focus();
    return;
  }

  const contact = {
    id: id ? id : String(Date.now()) ,
    name, phone, email, relationship
  };

  chrome.storage.local.get({contacts: []}, (data) => {
    const list = data.contacts || [];
    if (id) {
      // update
      const idx = list.findIndex(c => c.id === id);
      if (idx >= 0) list[idx] = contact;
      else list.push(contact);
    } else {
      list.push(contact);
    }
    chrome.storage.local.set({contacts: list}, () => {
      closeModal();
      renderContacts();
    });
  });
}

function renderContacts() {
  chrome.storage.local.get({contacts: []}, (data) => {
    const list = data.contacts || [];
    // sort by name (case-insensitive)
    list.sort((a,b)=> (a.name||'').toLowerCase().localeCompare((b.name||'').toLowerCase()));
    contactsBody.innerHTML = '';
    if (list.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 6;
      td.style.textAlign = 'center';
      td.style.color = '#666';
      td.textContent = 'No contacts — click Add to create one.';
      tr.appendChild(td);
      contactsBody.appendChild(tr);
      return;
    }

    for (const contact of list) {
      const tr = document.createElement('tr');

      const nameTd = document.createElement('td');
      nameTd.textContent = contact.name || '';
      tr.appendChild(nameTd);

      const phoneTd = document.createElement('td');
      phoneTd.textContent = contact.phone || '';
      tr.appendChild(phoneTd);

      const emailTd = document.createElement('td');
      emailTd.textContent = contact.email || '';
      tr.appendChild(emailTd);

      const relTd = document.createElement('td');
      relTd.textContent = contact.relationship || '';
      tr.appendChild(relTd);

      // DELETE column
      const delTd = document.createElement('td');
      const delBtn = document.createElement('button');
      delBtn.className = 'action-btn delete-btn';
      delBtn.textContent = 'Delete';
      delBtn.title = `Delete ${contact.name}`;
      delBtn.addEventListener('click', ()=> {
        if (confirm(`Delete contact "${contact.name}"?`)) {
          deleteContact(contact.id);
        }
      });
      delTd.appendChild(delBtn);
      tr.appendChild(delTd);

      // CHANGE column
      const editTd = document.createElement('td');
      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn edit-btn';
      editBtn.textContent = 'Change';
      editBtn.title = `Edit ${contact.name}`;
      editBtn.addEventListener('click', ()=> openEditModal(contact));
      editTd.appendChild(editBtn);
      tr.appendChild(editTd);

      contactsBody.appendChild(tr);
    }
  });
}

function deleteContact(id){
  chrome.storage.local.get({contacts: []}, (data) => {
    const list = (data.contacts || []).filter(c => c.id !== id);
    chrome.storage.local.set({contacts: list}, () => {
      renderContacts();
    });
  });
}
