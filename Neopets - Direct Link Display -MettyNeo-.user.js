// ==UserScript==
// @name         Neopets - Direct Link Display <MettyNeo>
// @version      0.4
// @description  Gives the results from direct links a much cleaner display and tracks # of coconut shy refreshes
// @author       Metamagic
// @match        https://www.neopets.com/halloween/process_cocoshy.phtml?coconut=*
// @match        https://www.neopets.com/halloween/strtest/process_strtest.phtml
// @match        https://www.neopets.com/amfphp/json.php/WheelService.spinWheel/*
// @match        http://ncmall.neopets.com/games/giveaway/process_giveaway.phtml
// @run-at       document-start
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// ==/UserScript==

function addCSS() {
    document.head.appendChild(document.createElement("style")).innerHTML = `
    .container {
        width: 400px;
        height: fit-content;
        visibility: hidden;
    }
    .title {
        width: fit-content;
        height: 30px;
        background-color: inherit;
        text-align: center;
        line-height: 100%;
        font-size: 30px;
        font-weight: bold;
        font-family: "Impact", Copperplate;
        color: #FFFFFF;
        -webkit-text-stroke: 1px black;
        padding: 8px;
        visibility: visible;
    }
    .box {
        border-style: solid;
        border-width: 1px;
        border-color: #000;
        width: fit-content;
        height: fit-content;
        background-color: inherit;
        padding: 16px;
        transform: translate(0px, -48px);
        visibility: visible;
    }
    .contents {
        padding-top: 30px;
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: column;
        visibility: visible;
    }
    .msg {
        padding: 8px;
        font-size: 18px;
        line-height: 18px;
        visibility: visible;
    }
    .count {
        width: fit-content;
        height: 30px;
        background-color: inherit;
        text-align: center;
        align-items: end;
        line-height: 100%;
        color: #FFFFFF;
        padding: 8px;
        padding-top: 4px;
        padding-bottom: 12px;
        visibility: visible;
        display: flex;
        transform: translateX(-1px);
        position: relative;

    }
    .header {
        width: 100% !important;
        display: flex;
        background-color: inherit;
        transform: translateX(8px);
        position: relative;
        z-index: 1;
    }
`
}

const wheelmap = {
    1: "Knowledge",
    2: "Excitement",
    3: "Mediocrity",
    4: "Misfortune",
    5: "Monotony",
    6: "Extravagance"
}

const coconutmap = {
    26800: "Angry",
    26806: "Burning",
    26848: "Damaged",
    27162: "Golden",
    26873: "Hairy",
    26804: "Horned",
    26805: "Infernal",
    27083: "Light Brown",
    26807: "Mini",
    27087: "Moaning",
    26809: "Monstrous",
    26875: "Stitched",
    27085: "One Eyed",
    26874: "Painted",
    27082: "Scorched",
    26803: "Screaming",
    26808: "Silent",
    26801: "Sinister",
    27060: "Sliced",
    26872: "Tusked",
    27084: "Wailing",
    26802: "Ugly",
    27086: "Vicious"
}

const inactiveColor = {box: "#616161", content: "#C2C2C2"}

const url = window.location.href

//============================
// coconut shy refresh tracker
//============================

//increments coconut shy on each refresh
if(url.includes("/process_cocoshy.phtml")) {
    //resets count on new day
    if(GM_getValue("day", null) != getTime().date) {
        GM_setValue("cscount", 1)
        GM_setValue("day", getTime().date)
    }

    //subsequent refreshes
    addEventListener("beforeunload", (e) => {
        //increments refresh count
        let count = GM_getValue("cscount", 1) //first load = count of 1
        if(count < 20) count++
        GM_setValue("cscount", count)
    })
}

//runs on page load
(function() {
    //GM_deleteValue("cscount") //enable to reset coconut shy counter, for testing
    //fuck stackpath - it occasionally breaks parts of the script.
    if(!document.body.innerHTML.includes("Neopets - Checking Cookies")) {
        addCSS()
        let html = document.body.innerHTML
        console.log(html)
        let results = createResultsBox()
        let contents = results.querySelector("#contents")

        if(url.includes("/process_cocoshy.phtml")) displayCocoShy(results, contents, html)
        else if(url.includes("/process_strtest.phtml")) displayStrTest(results, contents, html)
        else if(url.includes("/WheelService.spinWheel/")) displayWheel(results, contents, html, wheelmap[url.match(/^.*([12345]).*/)[1]])
        else if(url.includes("ncmall.neopets.com/games/giveaway/process_giveaway.phtml")) displayScarab(results, contents, html)
    }
    else console.log("stackpath moment")
})()

function getTime(date = new Date(), zeroTime = false) {
    let d = date.toLocaleString("en-US", {timeZone: "PST"}).split(",")
    if(zeroTime) return {date: d[0].trim(), time: "12:00:00 AM NST"}
    else return {date: d[0].trim(), time: d[1].trim()+" NST"}
}

const DAY_MS = 1000*60*60*24
function getFinishTime(ms=0, resetOnNewDay=true) {
    let d = new Date()
    //add time
    if(ms > 0) d.setTime(d.getTime() + ms)
    //reset on midnight next day
    if(getTime(d).date != getTime().date && resetOnNewDay) return getTime(d, true)
    return getTime(d)
}

//====================
// direct link display
//====================


function createResultsBox() {
    let cont = document.createElement("div")
    cont.classList.add("container")
    cont.id = "container"

    let header = document.createElement("div")
    header.classList.add("header")
    let title = document.createElement("div")
    title.classList.add("title")
    title.id = "title"
    header.appendChild(title)
    cont.appendChild(header)

    let box = document.createElement("div")
    box.classList.add("box")
    cont.appendChild(box)

    let contents = document.createElement("div")
    contents.classList.add("contents")
    contents.id = "contents"
    box.appendChild(contents)

    document.body.innerHTML = ""
    document.body.appendChild(cont)

    return cont
}

function displayCocoShy(results, contents, html) {
    //fun fact i actually won a coconut while developing this script. saved the result below for testing.
    //html = `points=10000&amp;totalnp=4097858&amp;success=4&amp;prize_id=26874&amp;error=Ach%21+See%2C+the+game+isn%27t+rigged+after+all%21++Tell+your+friends%2C+kid%21`
    //out of throws
    if(html.includes("success=0")) {
        results.style.backgroundColor = inactiveColor.box
        contents.style.backgroundColor = inactiveColor.content
    }
    else {
        results.style.backgroundColor = "#4D226B"
        contents.style.backgroundColor = "#E4D3EB"
    }
    results.querySelector("#title").innerHTML = "Coconut Shy"

    let countdiv = document.createElement("div")
    countdiv.classList.add("count")
    let count = Math.min(GM_getValue("cscount", 1), 20)
    countdiv.innerHTML = "<b>(Count:</b>&nbsp"+count+"<b>)</b>"
    results.children[0].appendChild(countdiv)

    let msg = document.createElement("div")
    msg.classList.add("msg")
    msg.innerHTML = '"'+getMessage(html, "error=")+'"'
    contents.appendChild(msg)

    if(!html.includes("success=0")) {
        let npsummary = document.createElement("div")
        npsummary.classList.add("msg")
        npsummary.innerHTML = `NP Spent: 100 NP<br/>NP Earned: ${html.slice(7, html.length).split("&")[0]} NP<br/>New NP Balance: ${html.split("totalnp=")[1].split("&")[0]} NP`

        //coconut prize
        if(html.includes("prize_id=")) {
            document.body.style.backgroundColor = "#BEF7C1"
            let id = html.split("prize_id=")[1].split("&")[0]
            let coconut = `${coconutmap[id]} Evil Coconut` || `Unknown Coconut (Item ID: ${id})`
            npsummary.innerHTML += `<br>Prize: ${coconut}`
            delay(50).then(() => {window.alert("You won an evil coconut!")})
        }

        contents.appendChild(npsummary)
    }
    console.log("[DLD] Coconut Shy displayed.")
}

function displayStrTest(results, contents, html) {
    document.body.innerHTML = getMessage(html, "msg=")+"<br/>This display is WIP!"
}

function displayWheel(results, contents, html, type) {
    if(html.includes('"reply":')) document.body.innerHTML = type+": "+getMessage(html, '"reply":')+"<br/>This display is WIP!"
    else document.body.innerHTML = type+": "+getMessage(html, '"errmsg":')+"<br/>This display is WIP!"
}

function displayScarab(results, contents, html) {
    if(html.includes("success=0")) {
        results.style.backgroundColor = inactiveColor.box
        contents.style.backgroundColor = inactiveColor.content
    }
    else {
        results.style.backgroundColor = "#FAAE2A"
        contents.style.backgroundColor = "#FFF6D9"
        //7hr 7min cd
        GM_setValue("scarabtime", getFinishTime(1000*60*(7*60+7)).time)
    }
    results.querySelector("#title").innerHTML = "Qasalan Expellibox"

    let tval = GM_getValue("scarabtime", null)
    if(tval != null) {
        let time = document.createElement("div")
        time.classList.add("count")
        time.style.paddingTop = "8px"
        time.style.paddingBottom = "8px"
        time.innerHTML = `Refreshes at<br/>${tval}`
        results.children[0].appendChild(time)
    }


    let msg = document.createElement("div")
    msg.classList.add("msg")
    msg.innerHTML = getMessage(html, "msg=")
    contents.appendChild(msg)
}

function getMessage(html, tag) {
    return decodeURIComponent(html.split(tag)[1]).replaceAll("+", " ")
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
