let timeoutId_play;
let timeoutId_pause;

const currentTimes = [3, 6, 10, 12, 15, 18, 21, 25, 32, 35, 38, 41, 45, 48, 50, 53, 56, 60 + 0, 60 + 4, 60 + 8, 60 + 12, 60 + 15, 60 + 20, 60 + 24, 60 + 29, 60 + 33, 60 + 37]
let currentTimesPointer = 0;
let promisePlay;


function playLoop(currentTime, duration) {
    audio.src = './audio/blink_02.mp3';
    audio.currentTime = currentTime;
    promisePlay = audio.play();
    timeoutId_pause = setTimeout(_ => {
        promisePlay.then(_ => {
            audio.pause();
        })
    }, duration * 1000)
    timeoutId_play = setTimeout(_ => {
        playLoop(currentTime, duration)
    }, 2 * duration * 1000);
}

document.onclick = function(e) {
    let currentTime = currentTimes[currentTimesPointer]
    let duration = currentTimes[currentTimesPointer + 1] - currentTimes[currentTimesPointer]
    clearTimeout(timeoutId_pause)
    clearTimeout(timeoutId_play);
    playLoop(currentTime, duration)
    if (currentTimesPointer + 2 === currentTimes.length) {
        currentTimesPointer = 0;
    } else {
        currentTimesPointer += 1;
    }
}

document.addEventListener("dblclick", _ => {
    clearTimeout(timeoutId_pause)
    clearTimeout(timeoutId_play)
    promisePlay.then(_ => {
        audio.pause();
    })
})