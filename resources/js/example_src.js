'use strict';

var ComponentModal = require('../../index'),
	classie = require('classie'),
	ComponentModal1,
	modalButtonContainer;

var openModalButtonHandler = function (e) {
	if (classie.has(e.target, 'md-trigger')) {
		ComponentModal1.show(e.target.getAttribute('data-modal'));
	}
};

window.addEventListener('load', function () {
	modalButtonContainer = document.querySelector('#td-modal-buttons');
	ComponentModal1 = new ComponentModal({});
	modalButtonContainer.addEventListener('click', openModalButtonHandler, false);

	window.ComponentModal1 = ComponentModal1;
}, false);
