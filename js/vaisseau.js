import { Tir } from './tir.js';
import { Particule } from './particule.js';


export class Vaisseau{
    

    constructor(x,y,orientation,ctx,keyboard,assets,game){

        this.x=x;
        this.y=y;
        this.ctx=ctx;
        this.orientationVaisseau = orientation;
        this.orientationDeplacement=orientation;
        this.keyboard=keyboard; 
        this.assets = assets;     
        this.tir = [];

        this.img = assets.vaisseau5;

        this.width=32;
        this.height=32;
        this.vitesse = 0;
        this.game = game;
        
        this.peutTirer = false;
        let timer=true;
        this.particles = [];
        this.vaisseaux = [
            [this.assets.vaisseau13, this.assets.vaisseau12, this.assets.vaisseau1],
            [this.assets.vaisseau23, this.assets.vaisseau22, this.assets.vaisseau2],
            [this.assets.vaisseau33, this.assets.vaisseau32, this.assets.vaisseau3],
            [this.assets.vaisseau43, this.assets.vaisseau42, this.assets.vaisseau4],
            [this.assets.vaisseau53, this.assets.vaisseau52, this.assets.vaisseau5]
        ];
        this.particlesColors = [
            ['#1842f5', '#082dce', '#4868f2', '#374999', '#1a2c7c', '#102999', '#0528c1', '#2042d6'],
            ['#a154f6', '#9561ce', '#653799', '#5a1ca0', '#5c07bc', '#421377', '#8329e8', '#6608d1'],
            ['#79d671', '#6aa365', '#43843e', '#40a339', '#51e547', '#38ea2c', '#25bf1a', '#177c10'],
            ['#ec3e53', '#bf505d', '#77222c', '#991524', '#af081b', '#af081b', '#fc465b', '#ce061d'],
            ['#f44242', '#f45f41', '#f47641', '#f49441', '#f4a941', '#f4be41', '#f4d641', '#f4ee41']
        ];
        this.cadencesTir = [
            400,
            300,
            250,
            100,
            500
        ];

        this.canWiggle = true;
        this.wiggleNb = 0;
    }
    

    draw(){
        this.tirer();
        this.avancer();
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.orientationVaisseau+Math.PI/2);
        this.ctx.translate(-16, -16);

        this.img = this.vaisseaux[(this.game.vaisseauActuel - 1)][(this.game.vie - 1)];

        this.ctx.drawImage(this.img, 0, 0);
        this.tournerSurSoi();
        this.ctx.restore();
        for(let i = 0; i<this.tir.length; i++){
            if(this.tir != undefined){
                this.tir[i].draw();
                if (this.tir[i].x>this.ctx.canvas.clientWidth || this.tir[i].x<0 || this.tir[i].y>this.ctx.canvas.clientHeight || this.tir[i].y<0){
                    this.tir.splice(i,1);
                }   
            }
        }   
        
        for (let i = 0; i < this.particles.length; i++)
        {
            if (this.particles[i].exists)
            {
                this.particles[i].draw();
            }
            else
            {
                this.particles.splice(i, 1);
            }
        }
    }
    
    
    tournerSurSoi(){
        if(this.keyboard.keys.right){
           this.orientationVaisseau+= 0.1;
        }
        if(this.keyboard.keys.left){
            this.orientationVaisseau-=0.1;
        }
    }
    
    avancer(){
        if(this.keyboard.keys.up){
            if (this.vitesse < 3)
            {
                this.vitesse += 0.08;
            }
            this.orientationDeplacement = this.orientationVaisseau;

            if (this.game.vaisseauActuel == 4)
            {
                this.ejecterParticules(20);

                if (this.canWiggle)
                {
                    this.wiggleScreen(0, 0, false, 5, 10);
                    this.canWiggle = false;
                    setTimeout((() => {
                        this.canWiggle = true;
                    }).bind(this), 300);
                }
            }
            else
            {
                this.ejecterParticules(10);
            }
        }
        else
        {
            if (this.vitesse > 0)
            {
                this.vitesse -= 0.02;
            }
        }
        if(this.x<0){
            this.vitesse=0;
            this.x=1;
        }
        if(this.x>640){
            this.vitesse=0;
            this.x=639;
        }
        if(this.y<0){
            this.vitesse=0;
            this.y=1;
        }
        if(this.y>480){
            this.vitesse=0;
            this.y=479;
        }
        
        this.x+= this.vitesse*Math.cos(this.orientationDeplacement);
        this.y+= this.vitesse*Math.sin(this.orientationDeplacement);
        
    }
    
    tirer(){
        if(this.keyboard.keys.space && this.peutTirer){
            this.assets.fire.play();
            this.tir.push(new Tir(this.x-4 + 8*Math.cos(this.orientationVaisseau),
                                    this.y-4 + 8*Math.sin(this.orientationVaisseau),
                                    this.orientationVaisseau,this.ctx));
            this.peutTirer = false;
            setTimeout((() => {
                this.peutTirer = true;
            }).bind(this), this.cadencesTir[this.game.vaisseauActuel - 1]);
        }
    }

    ejecterParticules(nb)
    {
        for (let i = 0; i < nb; i++)
        {
            let size = Math.random() * 3 + 1;
            let randomizer = (Math.random() * 90 - 45)*Math.PI/180;
            let life = Math.random() * 1500;
            let vx = -Math.cos(this.orientationDeplacement + randomizer);
            let vy = -Math.sin(this.orientationDeplacement + randomizer);
            let x = this.x + -16*Math.cos(this.orientationDeplacement);
            let y = this.y + -16*Math.sin(this.orientationDeplacement);
            let color = this.particlesColors[this.game.vaisseauActuel - 1][Math.floor(Math.random()*this.particlesColors.length)];
            this.particles.push(new Particule(x, y, vx, vy, size, color, life, this.ctx));
        }
    }

    wiggleScreen(wiggleX, wiggleY, wiggleBack, wiggleSize, wiggleTimeout)
    {
        if ((wiggleX == 0 && wiggleY == 0) || wiggleBack == false)
        {
            wiggleX = Math.random() * wiggleSize + 1;
            wiggleY = Math.random() * wiggleSize + 1;
        }

        if (wiggleBack)
        {
            wiggleX = -wiggleX;
            wiggleY = -wiggleY;
        }

        if (this.wiggleNb < 20)
        {
            this.ctx.translate(wiggleX, wiggleY);

            setTimeout((() => {
                this.wiggleScreen(wiggleX, wiggleY, !wiggleBack, wiggleSize, wiggleTimeout);
            }).bind(this), wiggleTimeout);

            this.wiggleNb++;
        }
        else
        {
            this.wiggleNb = 0;
        }
    }
}