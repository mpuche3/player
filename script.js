// git add .
// git commit -m "message"
// git push
// git status

const xhr = new XMLHttpRequest();
const url = "tracks_books.json";
xhr.open("GET", url, false);
xhr.send();
const tracks = JSON.parse(xhr.responseText);

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
        const title = document.querySelector("body > div.container > button");
        title.innerHTML = `${audioFileFullPath}: ${currentTime} (${duration}seconds)`
    }
    
    function play() {
        const playbackRate = 0.8
        const additionalTimeintheloop = 2000
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
        audio.playbackRate = playbackRate;
        audio.pause();
        promisePlay = audio.play();
        status = "PLAYING";
        timeoutId_pause = setTimeout(_ => {
            promisePlay.then(_ => {
                audio.pause();
            });
        }, duration * 1000 * (1 / playbackRate))
        timeoutId_play = setTimeout(_ => {
            play();
        }, duration * 1000 * (1 / playbackRate) + additionalTimeintheloop);
    }

    function pause_play() {
        console.log("PAUSE_PLAY")
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
        console.log("NEXT")
        iCurrentTimes += 1;
        if (iCurrentTimes === tracks[itracks]["currentTimes"].length - 1) {
            nextTrack()
        };
        play();
    }
    
    function playPrevious() {
        iCurrentTimes -= 1;
        if (iCurrentTimes < 0) {iCurrentTimes = 0};
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

    document.querySelector(".button1").addEventListener("click", playNext)
    document.querySelector(".button2").addEventListener("click", playPrevious)    
    document.querySelector(".button3").addEventListener("click", previousTrack)
    document.querySelector(".button4").addEventListener("click", nextTrack)
    document.querySelector(".button5").addEventListener("click", pause_play)

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

const mpa = FactoryAudio()