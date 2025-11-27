

const cvs=document.getElementById("canvas");
const ctx=cvs.getContext("2d");

// player config 
let height=100;
let width=90;
let x=window.innerWidth/2 - width/2;
let y=window.innerHeight/2 - height/2;
let color="blue";
let speed=9;
let sprintSpeed=25;
let playerImage=new Image()
playerImage.src="assets/player.png"
let angles=0;
let isInvincible=false;

// world config
const wWidthTimes=2;
const wHeightTimes=2;
const StarsDensity=100;
const WorldCenter={x:window.innerWidth/2, y:window.innerHeight/2};
const WorldRadius=window.innerWidth * wWidthTimes;
const MaxAsteroids=5000;
const worldCenterX=window.innerWidth/2;
const worldCenterY=window.innerHeight/2;
let inGameTime=0;

// enemys config 
let eWidth=100;
let eHeight=100;
let eColor="red"; 
let eSpeed=2;
let maxEnemies=50;
let enemysImage=new Image()
enemysImage.src="assets/invaders.png"

// laser config 
const cX=Math.random() * wWidthTimes * window.innerWidth/3;
const cY=Math.random() * wHeightTimes * window.innerHeight/3;
const cRadius=700;
let cDuration=0;
const MaxCDuration=3;
const cSpawnTime=30;

let cLasers={};
let centerBoss={
    0:{
        x:cX, 
        y:cY, 
        r:cRadius,
    }
};
// ammo config
let Ammo=10;
let baseAmmoValue=Ammo;
let maxAmmoDrop=10;
let getAmmoPerDrop=20;
const ammoImg=new Image();
ammoImg.src="assets/ammo.png";

let ammos={};
fillDict(ammos, maxAmmoDrop);

// fuel config
let fuel=3;
let baseFuelValue=fuel;
let maxFuelDrop=5;
let getFuelPerDrop=3;
const fuelImg=new Image();
fuelImg.src="assets/fuel.png";

let fuels={};
fillDict(fuels, maxFuelDrop);

// extra vars-----------------------
let enemys={};
function fillDict(dict, amount){
    for(let i=0; i<amount; i+=1){
        dict[i]=null;
    }
}
fillDict(enemys, maxEnemies);
const keys=new Set();
let frameId;
let isDead=false;

let shootTo={};
let shootDuration=0;

let stars={}
fillDict(stars, StarsDensity)
let asteroids = [];
const asteroidImgs = [];
let collided=false;
// event listeners 
document.addEventListener("reload", resizeCvs());
document.addEventListener("fullscreenchange", resizeCvs());
document.addEventListener("resize", resizeCvs());

document.addEventListener("keydown", (ev)=>{
    keys.add(ev.key);
});

document.addEventListener("keyup", (ev)=>{
    keys.delete(ev.key);
});


function re(){
    document.addEventListener("keydown", (e) => {
        if(e.key == "r" && isDead){
            restartGame();
        }
    });
}
re();

function loadAsteroids(){
    for(let i=1; i<=3; i++){      
        const img = new Image();
        img.src = `assets/astroid${i}.png`; // i know the speeling si wrong
        asteroidImgs.push(img);
    }
}

loadAsteroids();
generateAsteroidRing();
document.addEventListener("click", (e)=>{shoot(e)});












// -------------------------------MAIN FRAMES-----------------------------

function main(){
    resizeCvs(); // adjust evrything
    frameId=requestAnimationFrame(main);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // draw stars and astroids first
    drawStars();
    drawAsteroids();
    //----------------------------
    //spawn drops
    spawnAmmo();
    spawnFuels();
    //---------------------------
    //enemies
    moveEntity(); // draws enemyies and move them to player
    doLetTheDamnEnemiesColide();
    //--------------------------
    // player
    shootMech(); // draw the shoot first then player on top
    rotateImage(playerImage, x, y, width, height, angles); // player
    movePlayer();    
    //---------------------------
    // draw laser and center boss
    drawLaser();
    // -------------------------
    // finally draw ui
    drawTime();
    drawDrops();
    //--------------------------
    // additional stuff
    inGameTime+=0.0166666667
    isInvincible=false;
    //-------------------------
}
main();
// ------------------------------------------------------------------------















// ----------------------------- GAME FUNCTIONS -----------------------------
function restartCenter(){
    lX=Math.random() * wHeightTimes;
    lY=Math.random() * wWidthTimes;
    lDuration=0;
    lasers={}
    inGameTime=0;
}

function resizeCvs(){
    cvs.width=window.innerWidth * 3;
    cvs.height=window.innerHeight * 3;
    cvs.style.position="absolute";
    cvs.style.top=0;
    cvs.style.left=0;
    x=window.innerWidth/2 - width/2;
    y=window.innerHeight/2 - height/2;
}

function restartGame(){
    enemys={};
    isDead=false;
    fillDict(enemys, maxEnemies);
    asteroids=[];
    generateAsteroidRing();
    restartCenter();
    Ammo=baseAmmoValue;
    fuel=baseFuelValue;
    ammos={}
    fuels={}
    fillDict(ammos, maxAmmoDrop)
    fillDict(fuels, maxFuelDrop)
    main();
}


function spawnThis(spawnWhat, howMany, possibleDistanceWidth, possibleDistanceHeight){
        for(let i=0; i < howMany; i+=1){
        if(spawnWhat[i] === null){
            

            let side = Math.floor(Math.random() * 4);

            const minDist = 200;
            const maxDistX = possibleDistanceWidth * wWidthTimes;
            const maxDistY = possibleDistanceHeight * wHeightTimes;

            let xPos, yPos;
            if(side === 0){
                xPos = Math.random() * possibleDistanceWidth * wWidthTimes;
                yPos = -minDist - Math.random() * maxDistY;
            }
            if(side === 1){
                xPos = Math.random() * possibleDistanceWidth * wWidthTimes;
                yPos = possibleDistanceHeight + minDist + Math.random() * maxDistY;
            }
            if(side === 2){
                xPos = -minDist - Math.random() * maxDistX;
                yPos = Math.random() * possibleDistanceHeight * wHeightTimes;
            }
            if(side === 3){
                xPos = possibleDistanceWidth + minDist + Math.random() * maxDistX;
                yPos = Math.random() * possibleDistanceHeight * wHeightTimes;
            }

            spawnWhat[i] = { x:xPos, y:yPos };
        }
    }
}

// ------------------------------------------------------------------------------

// -----------------------------------DRAWING------------------------------------
function drawTime(){
    ctx.beginPath();
    ctx.font="100px Arial";
    ctx.fillStyle='white';
    ctx.strokeStyle="white";
    ctx.fillText(Math.floor(inGameTime), window.innerWidth/2-40, 100);
    ctx.stroke();
}

function drawDrops(){
    ctx.beginPath();
    ctx.font="20px Arial";
    ctx.fillStyle='white';
    ctx.strokeStyle="white";
    ctx.fillText(Math.ceil(fuel), window.innerWidth-150, window.innerHeight-50);
    ctx.fillText(Ammo, window.innerWidth-150-150, window.innerHeight-50);
    ctx.stroke();
    rotateImage(fuelImg, window.innerWidth-150-25, window.innerHeight-50-25-50, 50, 50)
    rotateImage(ammoImg, window.innerWidth-150-12.5/2-150, window.innerHeight-50-25-50, 50, 50)
}

function drawLine(x, y){
    ctx.beginPath();
    ctx.moveTo(window.innerWidth/2, window.innerHeight/2);
    ctx.strokeStyle="#07ffc9ff";
    ctx.lineWidth=3;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
}

function rotateImage(img, x, y, w, h, angleDeg){
    const rad = angleDeg * Math.PI / 180;

    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    ctx.rotate(rad);
    ctx.drawImage(img, -w/2, -h/2, w, h);
    ctx.restore();
}
// -----------------------------------------------------------------------------

// -----------------------------------PLAYER-------------------------------------
function shootMech(){
    if (shootDuration != 0){
        drawLine(shootTo.x, shootTo.y);
        shootDuration-=1;
    }
    if (shootDuration <= 0){
        shootDuration=0;
        shootTo.x=null;
        shootTo.y=null;
    }
}

function movePlayer(){
    if(keys.has("w")){ // moves enemies
        for(let i=0; i<maxEnemies; i+=1){
            enemys[i].y+=speed;
            if(keys.has(" ") && fuel > 0){
                enemys[i].y+=sprintSpeed;
                isInvincible=true; // make player invincibe for a tick 
                fuel-=0.0166666667/60
            }
        }
        angles=0;
    }
    if(keys.has("s")){
        for(let i=0; i<maxEnemies; i+=1){
            enemys[i].y-=speed;
        if(keys.has(" ") && fuel > 0){
                enemys[i].y-=sprintSpeed;
                isInvincible=true;
                fuel-=0.0166666667/60
            }
        }
        angles=180
    }
    if(keys.has("d")){
        for(let i=0; i<maxEnemies; i+=1){
            enemys[i].x-=speed;
            if(keys.has(" ") && fuel > 0){
                enemys[i].x-=sprintSpeed;
                isInvincible=true;
                fuel-=0.0166666667/60
            }
        }
        angles=90
    }
    if(keys.has("a")){
        for(let i=0; i<maxEnemies; i+=1){
            enemys[i].x+=speed;
            if(keys.has(" ") && fuel > 0){
                enemys[i].x+=sprintSpeed;
                isInvincible=true;
                fuel-=0.00166666667/60
            }
        }
        angles=270
    }
    if(keys.has("w") && keys.has("d")){
        angles=45
    }
    if(keys.has("w") && keys.has("a")){
        angles=360-45
    }
    if(keys.has("s") && keys.has("d")){
        angles=180-45
    }
    if(keys.has("s") && keys.has("a")){
        angles=180+45
    }
}

function killPlayer(){
    ctx.beginPath();
    ctx.font="100px Arial";
    ctx.fillStyle='red';
    ctx.strokeStyle="white";
    ctx.fillText("You Died", window.innerWidth/2-150, window.innerHeight/2-50);
    ctx.stroke();
    isDead=true;
    rotate=0;
    cancelAnimationFrame(frameId);
    re();
}

function shoot(e){
    if(Ammo > 0){
        shootTo.x=e.clientX;
        shootTo.y=e.clientY;
        shootDuration=5;
        Ammo-=1
    }
}

// ----------------------------------------INVADERS------------------------------------
function moveEntity(){
    spawnThis(enemys, maxEnemies, window.innerWidth, window.innerHeight);
    for(let i=0; i<maxEnemies; i+=1){
        let dx = x - enemys[i].x;
        let dy = y - enemys[i].y;

        let dist = Math.hypot(dx, dy);
        dx = dx/dist;
        dy = dy/dist;
        enemys[i].angle = Math.atan2(dy, dx);
        console.log(enemys[0].angle * 120)
        if (enemys[i] != null){
            enemys[i].x += dx * eSpeed;
            enemys[i].y += dy * eSpeed;
            rotateImage(enemysImage, enemys[i].x, enemys[i].y, eWidth, eHeight, enemys[i].angle * 57.29578 + 90); // do not touch this
            if(collisionDetect(enemys[i].x, enemys[i].y, eWidth, eHeight, x, y, width, height)){
                killPlayer();
            }
            if(lineIntersectsRect(x, y, shootTo.x, shootTo.y, enemys[i].x, enemys[i].y, eWidth, eHeight) && shootDuration !== 0){
                enemys[i]=null;
                spawnThis(enemys, maxEnemies, window.innerWidth, window.innerHeight);
            }
        }
    }
}

function doLetTheDamnEnemiesColide(){
    for(let i=0; i < maxEnemies; i+=1){
        for(let j=0; j < maxEnemies; j+=1){
            if (collisionDetect(enemys[i].x, enemys[i].y, eWidth, eHeight,
                enemys[j].x, enemys[j].y, eWidth, eHeight
            )){
                if(enemys[i].x == enemys[j].x && enemys[i].y == enemys[j].y){
                    // do nothing
                } else if(enemys[j].x < enemys[i].x){
                    enemys[j].x-=eSpeed;
                } else if(enemys[j].x > enemys[i].x){
                    enemys[j].x+=eSpeed;
                } else if(enemys[j].y < enemys[i].y){
                    enemys[j].y-=eSpeed;
                } else if(enemys[j].y > enemys[i].y){
                    enemys[j].y+=eSpeed;
                }
            }
        }
    }
}
// ---------------------------------------------------------------------------

// --------------------------------COLLISIONS---------------------------------
function collisionDetect(x1, y1, w1, h1, x2, y2, w2, h2){
    if(
        x1 + w1 > x2 &&
        x1 < x2 + w2 &&
        y1 + h1 > y2 &&
        y1 < y2 +h2
    ){
        return true;
    }
}


function linesIntersect(x1,y1, x2,y2, x3,y3, x4,y4) {

    function ccw(ax,ay, bx,by, cx,cy) {
        return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
    }

    return (
        ccw(x1,y1, x3,y3, x4,y4) !== ccw(x2,y2, x3,y3, x4,y4) &&
        ccw(x1,y1, x2,y2, x3,y3) !== ccw(x1,y1, x2,y2, x4,y4)
    );
}

function lineIntersectsRect(x1,y1, x2,y2, rx,ry,rw,rh) {
    if (linesIntersect(x1,y1, x2,y2, rx, ry, rx, ry+rh)) return true;
    if (linesIntersect(x1,y1, x2,y2, rx+rw, ry, rx+rw, ry+rh)) return true;
    if (linesIntersect(x1,y1, x2,y2, rx, ry, rx+rw, ry)) return true;
    if (linesIntersect(x1,y1, x2,y2, rx, ry+rh, rx+rw, ry+rh)) return true;

    return false;
}

function circularcollisonDetect(x, y, cx, cy, w, h, r) {
    let closestX = Math.max(x, Math.min(cx, x + w));
    let closestY = Math.max(y, Math.min(cy, y + h));

    let dx = cx - closestX;
    let dy = cy - closestY;

    return (dx * dx + dy * dy) < (r * r);
}

// --------------------------------------------------------------------------

// ------------------------STARS & ASTEROIDS------------------------------------
function drawStars(){
    for(let i=0; i < StarsDensity; i+=1){
        if(stars[i] == null){
            let xPos=Math.random()*window.innerWidth;
            let yPos=Math.random()*window.innerHeight;
            let radius= Math.random()*5
            stars[i]={x:xPos, y:yPos, radius:radius}
        }
        else{
            // draws 
            ctx.beginPath();
            ctx.strokeStyle="white";
            ctx.fillStyle="white";
            ctx.arc(stars[i].x, stars[i].y, stars[i].radius, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
            stars[i].y+=1
            if(keys.has("w")){
                stars[i].y+=speed
                if(keys.has(" ")&& fuel > 0){
                    stars[i].y+=sprintSpeed;
                }
            }
            if(keys.has("s")){
                stars[i].y-=speed;
                if(keys.has(" ")&& fuel > 0){
                    stars[i].y-=sprintSpeed;
                }
            }
            if(keys.has("a")){
                stars[i].x+=speed;
                if(keys.has(" ") && fuel > 0){
                    stars[i].x+=sprintSpeed;
                }
            }
            if(keys.has("d")){
                stars[i].x-=speed;
                if(keys.has(" ") && fuel > 0){
                    stars[i].x-=sprintSpeed;
                }
            }
            if(stars[i].y > window.innerHeight || stars[i].y < 0 ||
                stars[i].x > window.innerWidth || stars[i].x < 0
            ){
                stars[i]=null
            }
        }
    }
}

function generateAsteroidRing(){
    const count = MaxAsteroids;          // how many asteroids
    const radius = WorldRadius;          // same as world ring

    for(let i=0; i<count; i++){
        const angle = Math.random() * Math.PI * 2;

        const dist = radius + (Math.random() * 400 - 200);

        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;

        const img = asteroidImgs[Math.floor(Math.random() * asteroidImgs.length)];

        asteroids.push({
            x,
            y,
            size:10 + Math.random()*80,
            img,
            rotation: Math.random()*Math.PI*2,
            spin: (Math.random()-.5) * 0.01
        });
    }
}

function drawAsteroids(){
    let timer=0;
    for(const a of asteroids){
        const sx = a.x - x + window.innerWidth/2;
        const sy = a.y - y + window.innerHeight/2;
        // spin
        a.rotation += a.spin;
        if (sx > -200 && sx < window.innerWidth+200 &&
            sy > -200 && sy < window.innerHeight+200){ // culling

            ctx.save();
            ctx.translate(a.x - x + window.innerWidth/2, a.y - y + window.innerHeight/2);
            ctx.rotate(a.rotation);
            if(a.img === "astroid3.png"){
                ctx.drawImage(a.img, -a.size/2, -a.size/2, a.size/8, a.size/8);
            }
            else if(a.img === "astroid2.png"){
                ctx.drawImage(a.img, -a.size/2, -a.size/2, a.size*2, a.size*2);
            }
            else{
                ctx.drawImage(a.img, -a.size/2, -a.size/2, a.size, a.size);
            }
            ctx.restore();
        }
        if(collisionDetect(x, y, width, height, a.x, a.y, a.size, a.size)){collided=true} else {collided=false}
        if(collided){
            killPlayer();
        } else {
            if(keys.has("w")){
                a.y+=speed
                if(keys.has(" ") && fuel > 0){
                    a.y+=sprintSpeed
                }
            }
            if(keys.has("s")){
                a.y-=speed;
                if(keys.has(" ") && fuel > 0){
                    a.y-=sprintSpeed
                }
            }
            if(keys.has("a")){
                a.x+=speed;
                if(keys.has(" ") && fuel > 0){
                    a.x+=sprintSpeed
                }
            }
            if(keys.has("d")){
                a.x-=speed;
                if(keys.has(" ") && fuel > 0){
                    a.x-=sprintSpeed
                }
            }
        }
    }
}

// -----------------------------------------------------------------------

// ---------------------LASERS AND CENTER BOSS----------------------------

function drawLaser(){
    if(Math.floor(inGameTime)>=cSpawnTime){
        addLasers(0, cX, cY, 0, -300000);
        addLasers(1, cX, cY, 0, 300000);
        addLasers(2, cX, cY, -300000, 0);
        addLasers(3, cX, cY, 300000, 0);
        moveDrops(cLasers, 4);
        moveDrops(centerBoss, 1);
        if(Math.floor(inGameTime) >= cSpawnTime+MaxCDuration){
            killPlayerFromCenter();
        }
        drawCenter();
    }
}

function addLasers(name, x, y, toX, toY){
    if(cLasers[name]===undefined){
        cLasers[name]={x:x, y:y, toX: toX, toY: toY, duration:0}
    }
    ctx.beginPath();
    ctx.moveTo(cLasers[name].x, cLasers[name].y);
    if(cLasers[name].duration <= MaxCDuration){
        ctx.strokeStyle="rgba(140, 8, 8, 0.27)";
        cLasers[name].duration+=0.0166666667
    } else {ctx.strokeStyle="rgba(140, 8, 8, 1)";}
    ctx.lineWidth=6;
    ctx.lineTo(cLasers[name].toX, cLasers[name].toY);
    ctx.stroke();
    ctx.closePath();
}

function drawCenter(){
    ctx.beginPath();
    if(cDuration<=MaxCDuration){
        ctx.strokeStyle="#a6a6a627";
        ctx.fillStyle="rgba(75, 75, 75, 0.27)";
        cDuration+=0.0166666667
    } else {
        ctx.strokeStyle="#a6a6a6ff";
        ctx.fillStyle="rgba(75, 75, 75, 1)";    
    }
    ctx.arc(centerBoss[0].x, centerBoss[0].y, centerBoss[0].r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}


function killPlayerFromCenter(){
    if(circularcollisonDetect(x, y, centerBoss[0].x, centerBoss[0].y, width, height, centerBoss[0].r)){
        killPlayer();
    }
    for(let i=0; i < 4; i+=1){
        if(lineIntersectsRect(cLasers[i].x, cLasers[i].y, cLasers[i].toX, cLasers[i].toY, x, y, width, height) && !isInvincible){
            killPlayer();
        }
    }
}

// ----------------------------------------------------------


// -------------------- DROPS ---------------------------
function spawnAmmo(){
    spawnThis(ammos, maxAmmoDrop, window.innerWidth, window.innerHeight);
    for(let i=0; i < maxAmmoDrop; i+=1){
        rotateImage(ammoImg, ammos[i].x, ammos[i].y, 40, 40, 0)
        if(collisionDetect(x, y, width, height, ammos[i].x, ammos[i].y, 40, 40)){
            Ammo+=getAmmoPerDrop;
            ammos[i]=null
            spawnThis(ammos, maxAmmoDrop, window.innerWidth, window.innerHeight);
        }
    }
    moveDrops(ammos, maxAmmoDrop);
}

function spawnFuels(){
    for(let i=0; i < maxFuelDrop; i+=1){
        spawnThis(fuels, maxFuelDrop, window.innerWidth, window.innerHeight);
        rotateImage(fuelImg, fuels[i].x, fuels[i].y, 40, 40, 0);
        if(collisionDetect(x, y, width, height, fuels[i].x, fuels[i].y, 40, 40)){
            fuel+=getFuelPerDrop;
            fuels[i]=null;
            spawnThis(fuels, maxFuelDrop, window.innerWidth, window.innerHeight);
        }
    }
    moveDrops(fuels, maxFuelDrop);
}

function moveDrops(drop, maxDrops){
    if(keys.has("w")){
        for(let i=0; i < maxDrops; i+=1){
            drop[i].y+=speed;
            if(keys.has(" ") && fuel > 0){
                drop[i].y+=sprintSpeed;
            }
        }
    }
    if(keys.has("s")){
        for(let i=0; i < maxDrops; i+=1){
            drop[i].y-=speed;
            if(keys.has(" ") && fuel > 0){
                drop[i].y-=sprintSpeed;
            }
        }
    }
    if(keys.has("a")){
        for(let i=0; i < maxDrops; i+=1){
            drop[i].x+=speed;
            if(keys.has(" ") && fuel > 0){
                drop[i].x+=sprintSpeed;
            }
        }
    }
    if(keys.has("d")){
        for(let i=0; i < maxDrops; i+=1){
            drop[i].x-=speed;
            if(keys.has(" ")  && fuel > 0){
                drop[i].x-=sprintSpeed;
            }
        }
    }
}