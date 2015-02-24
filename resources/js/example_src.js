'use strict';

var PushMenu = require('../../index'),
	StyliePushMenu,
	menuElement,
	menuTriggerElement;
// modalButtonContainer;

// var openModalButtonHandler = function (e) {
// 	if (classie.has(e.target, 'md-trigger')) {
// 		ComponentModal1.show(e.target.getAttribute('data-modal'));
// 	}
// };

window.addEventListener('load', function () {
	menuElement = document.getElementById('ts-pushmenu-mp-menu');
	menuTriggerElement = document.getElementById('trigger');
	// modalButtonContainer = document.querySelector('#td-modal-buttons');
	StyliePushMenu = new PushMenu({
		type: 'cover', // 'cover',
		el: menuElement,
		trigger: menuTriggerElement
	});
	// modalButtonContainer.addEventListener('click', openModalButtonHandler, false);

	window.StyliePushMenu = StyliePushMenu;
}, false);
