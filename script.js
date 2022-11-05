const tracks = {
    "blink_00": {
        src: "./audio/blink_00.mp3",
        currentTimes: [4, 6, 11, 18, 22, 28, 37, 43, 52, 57, 60 + 5, 60 + 15, 60 + 22, 60 + 26, 60 + 28, 60 + 34, 60 + 39, 60 + 46, 60 + 56, 120 + 2, 120 + 6, 120 + 11]
    }, "blink_01": {
        src: "./audio/blink_01.mp3",
        currentTimes: [3, 7, 12, 16, 24, 27, 33, 39, 45, 50, 56, 60 + 2, 60 + 11, 60 + 16, 60 + 24, 60 + 35, 60 + 42],
    }, "blink_02": {
        src: './audio/blink_02.mp3',
        currentTimes: [3, 6, 10, 12, 15, 18, 21, 25, 32, 35, 38, 41, 45, 48, 50, 53, 56, 60 + 0, 60 + 4, 60 + 8, 60 + 12, 60 + 15, 60 + 20, 60 + 24, 60 + 29, 60 + 33, 60 + 37],
    }, 
}

const FactoryAudio = function () {
    const audio = document.createElement('audio'); 
    let track = "blink_00"
    let currentTimes = tracks[track].currentTimes;
    let timeoutId_play;
    let timeoutId_pause;
    let currentTimesPointer = -1;
    let promisePlay;
    let status = "PAUSED";
    audio.src = tracks[track].src;

    function getStatus () {
        return status
    }

    function playLoop(currentTime, duration) {
        audio.currentTime = currentTime;
        promisePlay = audio.play();
        status = "PLAYING";
        timeoutId_pause = setTimeout(_ => {
            promisePlay.then(_ => {
                audio.pause();
            })
        }, duration * 1000)
        timeoutId_play = setTimeout(_ => {
            playLoop(currentTime, duration)
        }, duration * 1000 + 1000);
    }
    
    function play() {
        if (currentTimesPointer === -1) currentTimesPointer = 1
        let currentTime = currentTimes[currentTimesPointer];
        let duration = currentTimes[currentTimesPointer + 1] - currentTimes[currentTimesPointer];
        clearTimeout(timeoutId_pause);
        clearTimeout(timeoutId_play);
        playLoop(currentTime, duration);
    }

    function pause() {
        clearTimeout(timeoutId_pause)
        clearTimeout(timeoutId_play)
        return promisePlay.then(_ => {
            audio.pause();
            status = "PAUSED";
        })
    }

    function playNext() {
        currentTimesPointer += 1
        if (currentTimesPointer + 1 === currentTimes.length) currentTimesPointer = 0;
        play();
    }
    
    function playPrevious() {
        currentTimesPointer -= 1;
        if (currentTimesPointer < 0) currentTimesPointer = 0;
        play();
    }

    function nextTrack() {
        x = track.slice(7,8);
        x = +x
        x += 1;
        if (x === 3) x = 0;
        track = "blink_0" + x;
        audio.src = tracks[track].src;
        currentTimesPointer = 0;
        currentTimes = tracks[track].currentTimes;
        play()
    }

    function previousTrack() {
        x = track.slice(7,8);
        x = +x
        x -= 1;
        if (x < 0) x = "0";
        track = "blink_0" + x;
        audio.src = tracks[track].src;
        currentTimesPointer = 0;
        currentTimes = tracks[track].currentTimes;
        play()
    }

    document.addEventListener('swiped-right', playPrevious);
    document.addEventListener('swiped-left', playNext);
    document.addEventListener('swiped-up', previousTrack);
    document.addEventListener('swiped-down', nextTrack);
    document.addEventListener("click", _ => {
        if (status === "PLAYING") {
            pause()
        } else {
            play()
        }
    });

    return {playPrevious, playNext, pause, play, getStatus, nextTrack, previousTrack}
}

// const href = window.location.href
// const alternative_track = href.split("=").pop()
// if (alternative_track !== href) track = alternative_track
const audio = FactoryAudio()


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