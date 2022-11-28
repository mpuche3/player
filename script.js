const tracks = [{
        audioFileFullPath: "./audio/blink_00.mp3",
        currentTimes: [0, 4, 6, 11, 18, 22, 28, 37, 43, 52, 57, 60 + 5, 60 + 15, 60 + 22, 60 + 26, 60 + 28, 60 + 34, 60 + 39, 60 + 46, 60 + 56, 120 + 2, 120 + 6, 120 + 11]
    }, {
        audioFileFullPath: "./audio/blink_01.mp3",
        currentTimes: [0, 3, 7, 12, 16, 24, 27, 33, 39, 45, 50, 56, 60 + 2, 60 + 11, 60 + 16, 60 + 24, 60 + 35, 60 + 42],
    }, {
        audioFileFullPath: './audio/blink_02.mp3',
        currentTimes: [0, 3, 6, 10, 12, 15, 18, 21, 25, 32, 35, 38, 41, 45, 48, 50, 53, 56, 60 + 0, 60 + 4, 60 + 8, 60 + 12, 60 + 15, 60 + 20, 60 + 24, 60 + 29, 60 + 33, 60 + 37],
    }, {
    //     audioFileFullPath: './audio/blink_10.mp3',
    //     currentTimes: [0, 3, 6, 9, 14, 19, 25, 33, 41, 46, 50, 55.5, 59.5, 60 + 3, 60 + 7, 60 + 13, 60 + 17, 60 + 24, 60 + 32, 60 + 40, 60 + 43, 60 + 47.5, 60 + 52, 60 + 58, 120 + 0.5, 120 + 4, 120 + 10]
    // }, {
        audioFileFullPath: './audio/blink_11.mp3',
        currentTimes: [0, 3, 10, 16, 21, 26, 34, 40, 46, 49, 53, 60, 60 + 5, 60 + 9, 60 + 18, 60 + 22, 60 + 29, 60 + 39, 60 + 43, 60 + 46, 60 + 51, 60 + 56]
    }
]

const FactoryAudio = function () {
    let audio = document.createElement('audio'); 
    let itracks = 0;
    let iCurrentTimes = 0;
    let timeoutId_play;
    let timeoutId_pause;
    let promisePlay;
    let status = "PAUSED";
    
    function getStatus () {
        return status
    }

    function update_title(audioFileFullPath, currentTime, duration) {
        const title = document.querySelector("#title");
        title.innerHTML = `${audioFileFullPath}: ${currentTime} (${duration}seconds)`
    }
    
    function play() {
        const audioFileFullPath = tracks[itracks]["audioFileFullPath"];
        const currentTime = tracks[itracks]["currentTimes"][iCurrentTimes];
        const nextTime = tracks[itracks]["currentTimes"][iCurrentTimes + 1];
        const duration = nextTime - currentTime;
        clearTimeout(timeoutId_pause);
        clearTimeout(timeoutId_play);
        update_title(audioFileFullPath, currentTime, duration);
        // WTF: 
        // If audio.scr is set after audio.currentTime, 
        // then audio.currentTime will be set to zero.
        audio.src = audioFileFullPath;
        audio.currentTime = currentTime;
        promisePlay = audio.play();
        status = "PLAYING";
        timeoutId_pause = setTimeout(_ => {
            promisePlay.then(_ => {
                audio.pause();
            });
        }, duration * 1000)
        const additionalTimeintheloop = 1000;
        timeoutId_play = setTimeout(_ => {
            play();
        }, duration * 1000 + additionalTimeintheloop);
    }

    function pause_play() {
        clearTimeout(timeoutId_pause);
        clearTimeout(timeoutId_play);
        if (status === "PLAYING") {
            promisePlay.then(_ => {
                audio.pause();
                status = "PAUSED";
            });
        } else {
            play();
        }
    }

    function playNext() {
        iCurrentTimes += 1;
        if (iCurrentTimes === tracks[itracks]["currentTimes"].length) iCurrentTimes = 0;
        play();
    }
    
    function playPrevious() {
        iCurrentTimes -= 1;
        if (iCurrentTimes < 0) iCurrentTimes = 0;
        play();
    }

    function nextTrack() {
        iCurrentTimes = 0;
        itracks += 1;
        if (itracks === tracks.len) x = 0;
        play();
    }

    function previousTrack() {
        iCurrentTimes = 0;
        itracks -= 1;
        if (itracks < 0) x = 0;
        play();
    }

    document.addEventListener('swiped-right', playPrevious);
    document.addEventListener('swiped-left', playNext);
    document.addEventListener('swiped-up', previousTrack);
    document.addEventListener('swiped-down', nextTrack);
    document.addEventListener("click", pause_play);

    document.onkeydown = function (event) {
        const callback = {
            "ArrowLeft"  : playPrevious,
            "ArrowRight" : playNext,
            "ArrowUp"    : previousTrack,
            "ArrowDown"  : nextTrack,
            "Enter"      : pause_play,
        }
        callback[event.key]()
    }
    
    return {audio, playPrevious, playNext, pause_play, play, getStatus, nextTrack, previousTrack}
}

// const href = window.location.href
// const alternative_track = href.split("=").pop()
// if (alternative_track !== href) track = alternative_track
const mpa = FactoryAudio()

const bbb = 3;
/*!
 * swiped-events.js - v@version@
 * Pure JavaScript swipe events
 * https://github.com/john-doherty/swiped-events
 * @inspiration https://stackoverflow.com/questions/16348031/disable-scrolling-when-touch-moving-certain-element
 * @author John Doherty <www.johndoherty.info>
 * @license MIT
 */
(function (window, document) {
    'use strict';

    // patch CustomEvent to allow constructor creation (IE/Chrome)
    if (typeof window.CustomEvent !== 'function') {

        window.CustomEvent = function (event, params) {

            params = params || { bubbles: false, cancelable: false, detail: undefined };

            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };

        window.CustomEvent.prototype = window.Event.prototype;
    }

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    var xDown = null;
    var yDown = null;
    var xDiff = null;
    var yDiff = null;
    var timeDown = null;
    var startEl = null;

    /**
     * Fires swiped event if swipe detected on touchend
     * @param {object} e - browser event object
     * @returns {void}
     */
    function handleTouchEnd(e) {

        // if the user released on a different target, cancel!
        if (startEl !== e.target) return;

        var swipeThreshold = parseInt(getNearestAttribute(startEl, 'data-swipe-threshold', '20'), 10); // default 20px
        var swipeTimeout = parseInt(getNearestAttribute(startEl, 'data-swipe-timeout', '500'), 10);    // default 500ms
        var timeDiff = Date.now() - timeDown;
        var eventType = '';
        var changedTouches = e.changedTouches || e.touches || [];

        if (Math.abs(xDiff) > Math.abs(yDiff)) { // most significant
            if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
                if (xDiff > 0) {
                    eventType = 'swiped-left';
                }
                else {
                    eventType = 'swiped-right';
                }
            }
        }
        else if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
            if (yDiff > 0) {
                eventType = 'swiped-up';
            }
            else {
                eventType = 'swiped-down';
            }
        }

        if (eventType !== '') {

            var eventData = {
                dir: eventType.replace(/swiped-/, ''),
                touchType: (changedTouches[0] || {}).touchType || 'direct',
                xStart: parseInt(xDown, 10),
                xEnd: parseInt((changedTouches[0] || {}).clientX || -1, 10),
                yStart: parseInt(yDown, 10),
                yEnd: parseInt((changedTouches[0] || {}).clientY || -1, 10)
            };

            // fire `swiped` event event on the element that started the swipe
            startEl.dispatchEvent(new CustomEvent('swiped', { bubbles: true, cancelable: true, detail: eventData }));

            // fire `swiped-dir` event on the element that started the swipe
            startEl.dispatchEvent(new CustomEvent(eventType, { bubbles: true, cancelable: true, detail: eventData }));
        }

        // reset values
        xDown = null;
        yDown = null;
        timeDown = null;
    }

    /**
     * Records current location on touchstart event
     * @param {object} e - browser event object
     * @returns {void}
     */
    function handleTouchStart(e) {

        // if the element has data-swipe-ignore="true" we stop listening for swipe events
        if (e.target.getAttribute('data-swipe-ignore') === 'true') return;

        startEl = e.target;

        timeDown = Date.now();
        xDown = e.touches[0].clientX;
        yDown = e.touches[0].clientY;
        xDiff = 0;
        yDiff = 0;
    }

    /**
     * Records location diff in px on touchmove event
     * @param {object} e - browser event object
     * @returns {void}
     */
    function handleTouchMove(e) {

        if (!xDown || !yDown) return;

        var xUp = e.touches[0].clientX;
        var yUp = e.touches[0].clientY;

        xDiff = xDown - xUp;
        yDiff = yDown - yUp;
    }

    /**
     * Gets attribute off HTML element or nearest parent
     * @param {object} el - HTML element to retrieve attribute from
     * @param {string} attributeName - name of the attribute
     * @param {any} defaultValue - default value to return if no match found
     * @returns {any} attribute value or defaultValue
     */
    function getNearestAttribute(el, attributeName, defaultValue) {

        // walk up the dom tree looking for attributeName
        while (el && el !== document.documentElement) {

            var attributeValue = el.getAttribute(attributeName);

            if (attributeValue) {
                return attributeValue;
            }

            el = el.parentNode;
        }

        return defaultValue;
    }

}(window, document));