/*
 * stylie.pushmenu
 * https://github.com/typesettin/stylie.pushmenu
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */
'use strict';

var classie = require('classie'),
	detectCSS = require('detectcss'),
	extend = require('util-extend'),
	events = require('events'),
	util = require('util');

/**
 * A module that represents a PushMenu object, a componentTab is a page composition tool.
 * @{@link https://github.com/typesettin/stylie.pushmenu}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @constructor PushMenu
 * @requires module:util-extent
 * @requires module:util
 * @requires module:events
 * @param {object} el element of tab container
 * @param {object} options configuration options
 */
var PushMenu = function (options) {
	events.EventEmitter.call(this);

	this.options = extend(this.options, options);
	// console.log(this.options);
	this._init();
	// this.show = this._show;
	// this.hide = this._hide;
};

util.inherits(PushMenu, events.EventEmitter);

// taken from https://github.com/inuyaksa/jquery.nicescroll/blob/master/jquery.nicescroll.js
var hasParent = function (e, id) {
	if (!e) {
		return false;
	}
	else {
		var el = e.target || e.srcElement || e || false;
		while (el && el.id !== id) {
			el = el.parentNode || false;
		}
		return (el !== false);
	}
};

// returns the depth of the element "e" relative to element with id=id
// for this calculation only parents with classname = waypoint are considered
var getLevelDepth = function (e, id, waypoint, cnt) {
	cnt = cnt || 0;
	if (e.id.indexOf(id) >= 0) {
		return cnt;
	}
	else {
		if (classie.has(e, waypoint)) {
			++cnt;
		}
		return e.parentNode && getLevelDepth(e.parentNode, id, waypoint, cnt);
	}
};

// returns the closest element to 'e' that has class "classname"
var closest = function (e, classname) {
	if (classie.has(e, classname)) {
		return e;
	}
	return e.parentNode && closest(e.parentNode, classname);
};


/** module default configuration */
PushMenu.prototype.options = {
	el: null,
	trigger: null,
	// overlap: there will be a gap between open levels
	// cover: the open levels will be on top of any previous open level
	type: 'overlap', // overlap || cover
	// space between each overlaped level
	levelSpacing: 40,
	level: 0,
	// classname for the element (if any) that when clicked closes the current level
	backClass: 'ts-pushmenu-mp-back',
	pushedClass: 'ts-pushmenu-mp-pushed',
	levelClass: 'ts-pushmenu-mp-level',
	levelSelector: 'div.ts-pushmenu-mp-level',
	wrapperSelector: '#ts-pushmenu-mp-pusher',
	menuOpenClass: 'ts-pushmenu-mp-level-open',
	menuOverlayClass: 'ts-pushmenu-mp-level-overlay',
};
/**
 * initializes modals and shows current tab.
 * @emits modalsInitialized
 */
PushMenu.prototype._init = function () {
	// if menu is open or not
	this.options.open = false;
	this.options.type = (this.options.type === 'cover') ? 'cover' : 'overlap';
	this.options.support = detectCSS.feature('transform');
	// level depth
	this.options.level = 0;
	// the moving wrapper
	this.options.wrapper = document.querySelector(this.options.wrapperSelector);
	// the mp-level elements
	this.options.levels = Array.prototype.slice.call(this.options.el.querySelectorAll(this.options.levelSelector));
	// save the depth of each of these mp-level elements
	var self = this;
	this.options.levels.forEach(function (el, i) {
		el.setAttribute('data-level', getLevelDepth(el, self.options.el.id, self.options.levelClass));
		// console.log('levels i', i);
	});
	// the menu items
	this.options.menuItems = Array.prototype.slice.call(this.options.el.querySelectorAll('li'));
	// if type == "cover" these will serve as hooks to move back to the previous level
	this.options.levelBack = Array.prototype.slice.call(this.options.el.querySelectorAll('.' + this.options.backClass));
	// event type (if mobile use touch events)
	// this.options.eventtype = mobilecheck() ? 'touchstart' : 'click';
	// add the class mp-overlap or mp-cover to the main element depending on options.type
	classie.add(this.options.el, 'ts-pushmenu-mp-' + this.options.type);
	// initialize / bind the necessary events
	this._initEvents();
	this.emit('modalsInitialized');
};

/**
 * handle tab click events.
 */
PushMenu.prototype._initEvents = function () {
	var self = this;

	// the menu should close if clicking somewhere on the body
	var bodyClickFn = function (el) {
		self._resetMenu();
		el.removeEventListener('click', bodyClickFn);
	};

	// open (or close) the menu
	this.options.trigger.addEventListener('click', function (ev) {
		ev.stopPropagation();
		ev.preventDefault();
		if (self.options.open) {
			self._resetMenu();
		}
		else {
			self._openMenu();
			// the menu should close if clicking somewhere on the body (excluding clicks on the menu)
			document.addEventListener('click', function (ev) {
				if (self.options.open && !hasParent(ev.target, self.options.el.id)) {
					bodyClickFn(this);
				}
			});
		}
	});

	// opening a sub level menu
	this.options.menuItems.forEach(function (el, i) {
		// console.log('this.options.menuItems i', i);
		// check if it has a sub level
		var subLevel = el.querySelector(self.options.levelSelector);
		if (subLevel) {
			el.querySelector('a').addEventListener('click', function (ev) {
				ev.preventDefault();
				var level = closest(el, self.options.levelClass).getAttribute('data-level');
				if (self.options.level <= level) {
					ev.stopPropagation();
					classie.add(closest(el, self.options.levelClass), self.options.menuOverlayClass);
					self._openMenu(subLevel);
				}
			});
		}
	});

	// closing the sub levels :
	// by clicking on the visible part of the level element
	this.options.levels.forEach(function (el, i) {
		// console.log('this.options.levels i', i);
		el.addEventListener('click', function (ev) {
			ev.stopPropagation();
			var level = el.getAttribute('data-level');
			if (self.options.level > level) {
				self.options.level = level;
				// console.log('self.options.level', self.options.level)
				classie.remove(ev.target, self.options.menuOverlayClass);
				self._closeMenu();
			}
		});
	});

	// by clicking on a specific element
	this.options.levelBack.forEach(function (el, i) {
		// console.log('this.options.levelBack i', i);
		el.addEventListener('click', function (ev) {
			ev.preventDefault();
			var level = closest(el, self.options.levelClass).getAttribute('data-level');
			if (self.options.level <= level) {
				ev.stopPropagation();
				self.options.level = closest(el, self.options.levelClass).getAttribute('data-level') - 1;
				self.options.level === 0 ? self._resetMenu() : self._closeMenu();
			}
		});
	});
	this.emit('modalsEventsInitialized');
};

/**
 * _openMenu a modal component.
 * @param {string} modal name
 * @emits showModal
 */
PushMenu.prototype._openMenu = function (subLevel) {
	// increment level depth
	++this.options.level;

	// move the main wrapper
	var levelFactor = (this.options.level - 1) * this.options.levelSpacing,
		translateVal = this.options.type === 'overlap' ? this.options.el.offsetWidth + levelFactor : this.options.el.offsetWidth;

	this._setTransform('translate3d(' + translateVal + 'px,0,0)');

	if (subLevel) {
		// reset transform for sublevel
		this._setTransform('', subLevel);
		// need to reset the translate value for the level menus that have the same level depth and are not open
		for (var i = 0, len = this.options.levels.length; i < len; ++i) {
			var levelEl = this.options.levels[i];
			if (levelEl !== subLevel && !classie.has(levelEl, this.options.menuOpenClass)) {
				this._setTransform('translate3d(-100%,0,0) translate3d(' + -1 * levelFactor + 'px,0,0)', levelEl);
			}
		}
	}
	// add class mp-pushed to main wrapper if opening the first time
	if (this.options.level === 1) {
		classie.add(this.options.wrapper, this.options.pushedClass);
		this.options.open = true;
	}
	// add class mp-level-open to the opening level element
	classie.add(subLevel || this.options.levels[0], this.options.menuOpenClass);
};

// close the menu
PushMenu.prototype._resetMenu = function () {
	this._setTransform('translate3d(0,0,0)');
	this.options.level = 0;
	// remove class mp-pushed from main wrapper
	classie.remove(this.options.wrapper, this.options.pushedClass);
	this._toggleLevels();
	this.options.open = false;
};
// close sub menus
PushMenu.prototype._closeMenu = function () {
	var translateVal = this.options.type === 'overlap' ? this.options.el.offsetWidth + (this.options.level - 1) * this.options.levelSpacing : this.options.el.offsetWidth;
	this._setTransform('translate3d(' + translateVal + 'px,0,0)');
	this._toggleLevels();
};
// translate the el
PushMenu.prototype._setTransform = function (val, el) {
	el = el || this.options.wrapper;
	el.style.WebkitTransform = val;
	el.style.MozTransform = val;
	el.style.transform = val;
};
// removes classes mp-level-open from closing levels
PushMenu.prototype._toggleLevels = function () {
	for (var i = 0, len = this.options.levels.length; i < len; ++i) {
		var levelEl = this.options.levels[i];
		if (levelEl.getAttribute('data-level') >= this.options.level + 1) {
			classie.remove(levelEl, this.options.menuOpenClass);
			classie.remove(levelEl, this.options.menuOverlayClass);
		}
		else if (Number(levelEl.getAttribute('data-level')) === this.options.level) {
			classie.remove(levelEl, this.options.menuOverlayClass);
		}
	}
};

module.exports = PushMenu;
