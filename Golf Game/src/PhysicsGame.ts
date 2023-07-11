/* Assignment 2: Hole in the Ground
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { BoundingBox2, Vector3 } from 'gophergfx';
import { RigidBody } from './RigidBody';

export class PhysicsGame extends gfx.GfxApp
{
    // State variable to store the current stage of the game
    private stage: number;

    // Current hole radius
    private holeRadius: number;

    // Mesh of a ground plane with a hole in it
    private hole: gfx.Mesh;

    // Template mesh to create sphere instances
    private sphere: gfx.SphereMesh;

    // Bounding box that defines the dimensions of the play area
    private playArea: gfx.BoundingBox3;

    // Group that will hold all the rigid bodies currently in the scene
    private rigidBodies: gfx.Transform3;  

    // A plane mesh that will be used to display dynamic text
    private textPlane: gfx.PlaneMesh;

    // A dynamic texture that will be displayed on the plane mesh
    private text: gfx.Text;

    // A sound effect to play when an object falls inside the hole
    private holeSound: HTMLAudioElement;

    // A sound effect to play when the user wins the game
    private winSound: HTMLAudioElement;

    // Vector used to store user input from keyboard or mouse
    private inputVector: gfx.Vector2;

    constructor()
    {
        super();

        this.stage = 0;

        this.holeRadius = 1;
        this.hole = gfx.ObjLoader.load('./assets/hole.obj');
        this.sphere = new gfx.SphereMesh(1, 2);

        this.playArea = new gfx.BoundingBox3();
        this.rigidBodies = new gfx.Transform3();
        
        this.textPlane = new gfx.PlaneMesh();
        this.text = new gfx.Text('press a button to start', 512, 256, '48px Helvetica');
        this.holeSound = new Audio('./assets/hole.mp3');
        this.winSound = new Audio('./assets/win.mp3');

        this.inputVector = new gfx.Vector2();
    }

    createScene(): void 
    {
        // Setup the camera projection matrix, position, and look direction.
        // We will learn more about camera models later in this course.
        this.camera.setPerspectiveCamera(60, 1920/1080, 0.1, 50)
        this.camera.position.set(0, 12, 12);
        this.camera.lookAt(gfx.Vector3.ZERO);

        // Create an ambient light that illuminates everything in the scene
        const ambientLight = new gfx.AmbientLight(new gfx.Color(0.3, 0.3, 0.3));
        this.scene.add(ambientLight);

        // Create a directional light that is infinitely far away (sunlight)
        const directionalLight = new gfx.DirectionalLight(new gfx.Color(0.6, 0.6, 0.6));
        directionalLight.position.set(0, 2, 1);
        this.scene.add(directionalLight);

        // Set the hole mesh material color to green
        this.hole.material.setColor(new gfx.Color(83/255, 209/255, 110/255));

        // Create a bounding box for the game
        this.playArea.min.set(-10, 0, -16);
        this.playArea.max.set(10, 30, 8);

        // Position the text plane mesh on the ground
        this.textPlane.position.set(0, 0.1, 4.5);
        this.textPlane.scale.set(16, 8, 1);
        this.textPlane.rotateX(Math.PI/2);
        this.textPlane.rotateZ(Math.PI);

        // Set up the dynamic texture for the text plane
        const textMaterial = new gfx.UnlitMaterial();
        textMaterial.texture = this.text;
        this.textPlane.material = textMaterial;

        // Draw lines for the bounding box
        const playBounds = new gfx.Line3();
        playBounds.createFromBox(this.playArea);
        playBounds.color.set(1, 1, 1);
        this.scene.add(playBounds);

        // Add the objects to the scene
        this.scene.add(this.hole);
        this.scene.add(this.textPlane);
        this.scene.add(this.rigidBodies);
    }

    update(deltaTime: number): void 
    {
        // This code defines the gravity and friction parameters used in the
        // instructor's example implementation.  You can change them if you 
        // want to adjust your game mechanics and difficulty. However, note
        // that the spheres in the initial scene are placed purposefully
        // to allow you to visually check that your physics code is working.

        // The movement speed of the hole in meters / sec
        const holeSpeed = 10;

        // The friction constant will cause physics objects to slow down upon collision
        const frictionSlowDown = 0.9;

        // Hole radius scale factor
        const holeScaleFactor = 1.25;

        // Move hole based on the user input
        this.hole.position.x += this.inputVector.x * holeSpeed * deltaTime;
        this.hole.position.z -= this.inputVector.y * holeSpeed * deltaTime;



        // PART 1: HOLE MOVEMENT
        // The code above allows the user to move the hole in the X and Z directions.
        // However, we want to add some boundary checks to prevent the hole from
        // leaving the boundaries, which are defined in the playArea member variable.
        
        // ADD YOUR CODE
        //const radiusplus = 
        if(this.hole.position.x + this.holeRadius> this.playArea.max.x){
                this.hole.position.x = this.playArea.max.x - this.holeRadius;
        
        }
        if(this.hole.position.x - this.holeRadius < this.playArea.min.x){
                this.hole.position.x = this.playArea.min.x + this.holeRadius;
        
        }
        if(this.hole.position.z + this.holeRadius> this.playArea.max.z){
            this.hole.position.z = this.playArea.max.z - this.holeRadius;
    
        }
        if(this.hole.position.z - this.holeRadius < this.playArea.min.z){
            this.hole.position.z = this.playArea.min.z + this.holeRadius;
    
        }



        // Update rigid body physics
        // You do not need to modify this code
        this.rigidBodies.children.forEach((transform: gfx.Transform3) => {
            const rb = transform as RigidBody;
            rb.update(deltaTime);
        });

        // Handle object-object collisions
        // You do not need to modify this code
        for(let i=0; i < this.rigidBodies.children.length; i++)
        {
            for(let j=i+1; j < this.rigidBodies.children.length; j++)
            {
                const rb1 = this.rigidBodies.children[i] as RigidBody;
                const rb2 = this.rigidBodies.children[j] as RigidBody;

                this.handleObjectCollision(rb1, rb2, frictionSlowDown)
            }
        }

        // Handle object-environment collisions
        // You do not need to modify this code
        this.rigidBodies.children.forEach((transform: gfx.Transform3) => {
            const rb = transform as RigidBody;

            // The object has fallen far enough to score a point
            if(rb.position.y < -10)
            {
                this.holeSound.play(); 

                // Remove the object from the scene
                rb.remove();

                if(this.rigidBodies.children.length == 0)
                    this.startNextStage();
                else
                    this.setHoleRadius(this.holeRadius * holeScaleFactor);
            }
            // The object is within range of the hole and can fit inside
            else if(rb.getRadius() < this.holeRadius && rb.position.distanceTo(this.hole.position) < this.holeRadius)
            {
                this.handleRimCollision(rb, frictionSlowDown);
            }
            // The object has not fallen all the way into the hole yet
            else if(rb.position.y + rb.getRadius() > 0)
            {
                this.handleBoundaryCollision(rb, frictionSlowDown);
            }
            
        });
    }

    handleBoundaryCollision(rb: RigidBody, frictionSlowDown: number): void
    {


        // PART 3: BOUNDARY COLLISIONS
        
        // As a first step, you should review the explanations about detecting collisions,
        // updating position after a collision, and updating velocity after a collision.
        // In this method, you will need to:
        // 1. Check if the sphere is intersecting each boundary of the play area. 
        // 2. Correct the intersection by adjusting the position of the sphere.
        // 3. Compute the reflected velocity after the collision. Note that because the ground
        // and walls are aligned with the XYZ axes, this is the simple case of negating one
        // dimension of the velocity vector.
        // 4. After a collision, slow down the velocity due to friction. You can find an example
        // of how to use the frictionSlowDown parameter in the handleRimCollision() method.
        const b = new Vector3(-1, -1, -1);
        //if(this.playArea.intersects(rb.boundingBox)){
        //    rb.position.y = rb.position.y -1;
        //}

        //const boundspoint = gfx.Vector3.subtract(rb, this.playArea);
        
        /*if(rb.intersects(rb, gfx.IntersectionMode3.BOUNDING_SPHERE)){
            rb.velocity.y = rb.velocity.y * -1;
        }
        */
       rb.position.x 
       /*
       const bottom = new gfx.Vector3(rb.position.x, 0, rb.position.z);
       const bottompoint = gfx.Vector3.subtract(bottom, rb.position);
       bottompoint.normalize();
       bottompoint.multiplyScalar(rb.getRadius());
       bottompoint.add(rb.position.clone());
       const top = new gfx.Vector3(rb.position.x, 30, rb.position.z);
       const toppoint = gfx.Vector3.subtract(top, rb.position);
       toppoint.normalize();
       toppoint.multiplyScalar(rb.getRadius());
       toppoint.add(rb.position.clone());
       const left1 = new gfx.Vector3(-10, rb.position.y, rb.position.z);
       const left1point = gfx.Vector3.subtract(left1, rb.position);
       left1point.normalize();
       left1point.multiplyScalar(rb.getRadius());
       left1point.add(rb.position.clone());
       const left2 = new gfx.Vector3(10, rb.position.y, rb.position.z);
       const left2point = gfx.Vector3.subtract(left2, rb.position);
       left2point.normalize();
       left2point.multiplyScalar(rb.getRadius());
       left2point.add(rb.position.clone());
       const right1 = new gfx.Vector3(rb.position.x, rb.position.y, -16);
       const right1point = gfx.Vector3.subtract(right1, rb.position);
       right1point.normalize();
       right1point.multiplyScalar(rb.getRadius());
       right1point.add(rb.position.clone());
       const right2 = new gfx.Vector3(rb.position.x, rb.position.y, 8);
       const right2point = gfx.Vector3.subtract(right2, rb.position);
       right2point.normalize();
       right2point.multiplyScalar(rb.getRadius());
       right2point.add(rb.position.clone());
        if(rb.position.y < 0){
            const correctionDist = rb.getRadius() - rb.position.distanceTo(bottom);
            const correctionMove = gfx.Vector3.subtract(rb.position, bottom);
            correctionMove.normalize();
            correctionMove.multiplyScalar(correctionDist);
            rb.position.add(correctionMove);
            const thenormal = gfx.Vector3.subtract(rb.position, bottompoint);
            thenormal.normalize();
            rb.velocity.reflect(thenormal);
            //rb.velocity.y = rb.velocity.y * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
            
        }
        if(rb.position.y > 30){
            const correctionDist = rb.getRadius() - rb.position.distanceTo(top);
            const correctionMove = gfx.Vector3.subtract(rb.position, top);
            correctionMove.normalize();
            correctionMove.multiplyScalar(correctionDist);
            rb.position.add(correctionMove);
            const thenormal = gfx.Vector3.subtract(rb.position, toppoint);
            thenormal.normalize();
            rb.velocity.reflect(thenormal);
            //rb.velocity.y = rb.velocity.y * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        if(rb.position.x < -10){
            const correctionDist = rb.getRadius() - rb.position.distanceTo(left1);
            const correctionMove = gfx.Vector3.subtract(rb.position, left1);
            correctionMove.normalize();
            correctionMove.multiplyScalar(correctionDist);
            rb.position.add(correctionMove);
            const thenormal = gfx.Vector3.subtract(rb.position, left1point);
            thenormal.normalize();
            rb.velocity.reflect(thenormal);
            //rb.velocity.x = rb.velocity.x * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        if(rb.position.x > 10){
            const correctionDist = rb.getRadius() - rb.position.distanceTo(left2);
            const correctionMove = gfx.Vector3.subtract(rb.position, left2);
            correctionMove.normalize();
            correctionMove.multiplyScalar(correctionDist);
            rb.position.add(correctionMove);
            const thenormal = gfx.Vector3.subtract(rb.position, left2point);
            thenormal.normalize();
            rb.velocity.reflect(thenormal);
            //rb.velocity.x = rb.velocity.x * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        if(rb.position.z < -16){
            const correctionDist = rb.getRadius() - rb.position.distanceTo(right1);
            const correctionMove = gfx.Vector3.subtract(rb.position, right1);
            correctionMove.normalize();
            correctionMove.multiplyScalar(correctionDist);
            rb.position.add(correctionMove);
            const thenormal = gfx.Vector3.subtract(rb.position, right1point);
            thenormal.normalize();
            rb.velocity.reflect(thenormal);
            //rb.velocity.z = rb.velocity.z * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        if(rb.position.z > 8){
            const correctionDist = rb.getRadius() - rb.position.distanceTo(right2);
            const correctionMove = gfx.Vector3.subtract(rb.position, right2);
            correctionMove.normalize();
            correctionMove.multiplyScalar(correctionDist);
            rb.position.add(correctionMove);
            const thenormal = gfx.Vector3.subtract(rb.position, right2point);
            thenormal.normalize();
            rb.velocity.reflect(thenormal);
            //rb.velocity.z = rb.velocity.z * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        //rb.velocity.multiplyScalar(frictionSlowDown);
        // ADD YOUR CODE HERE
        */
        if(rb.position.x + rb.getRadius() > this.playArea.max.x){
            rb.position.x = this.playArea.max.x - rb.getRadius();
            rb.velocity.x = rb.velocity.x * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
    
        }
        if(rb.position.x - rb.getRadius() < this.playArea.min.x){
            rb.position.x = this.playArea.min.x + rb.getRadius();
            rb.velocity.x = rb.velocity.x * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        if(rb.position.y + rb.getRadius() > this.playArea.max.y){
            rb.position.y = this.playArea.max.y - rb.getRadius();
            rb.velocity.y = rb.velocity.y * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
    
        }
        if(rb.position.y - rb.getRadius() < this.playArea.min.y){
            rb.position.y = this.playArea.min.y + rb.getRadius();
            rb.velocity.y = rb.velocity.y * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        if(rb.position.z + rb.getRadius() > this.playArea.max.z){
            rb.position.z = this.playArea.max.z - rb.getRadius();
            rb.velocity.z = rb.velocity.z * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
    
        }
        if(rb.position.z - rb.getRadius() < this.playArea.min.z){
            rb.position.z = this.playArea.min.z + rb.getRadius();
            rb.velocity.z = rb.velocity.z * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        

    }

    handleObjectCollision(rb1: RigidBody, rb2: RigidBody, frictionSlowDown: number): void
    {
        

        // PART 4: RIGID BODY COLLISIONS
        // This is the most challenging part of this assignment, so make sure to
        // read all the information described in the README.  If you are struggling 
        // with understanding the math or have questions about how to implement the 
        // equations, then you should seek help from the instructor or TA. 

        // ADD YOUR CODE HERE
        /*
        if(rb1.position.x + rb1.getRadius() == rb2.position.x + rb2.getRadius()){
            rb1.position.x = rb1.position.x - (rb1.getRadius() / 2);
            rb2.position.x = rb2.position.x - (rb2.getRadius() / 2);
            rb.velocity.x = rb.velocity.x * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
    
        }
        if(rb.position.x - rb.getRadius() < this.playArea.min.x){
            rb.position.x = this.playArea.min.x + rb.getRadius();
            rb.velocity.x = rb.velocity.x * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        if(rb.position.y + rb.getRadius() > this.playArea.max.y){
            rb.position.y = this.playArea.max.y - rb.getRadius();
            rb.velocity.y = rb.velocity.y * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
    
        }
        if(rb.position.y - rb.getRadius() < this.playArea.min.y){
            rb.position.y = this.playArea.min.y + rb.getRadius();
            rb.velocity.y = rb.velocity.y * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        if(rb.position.z + rb.getRadius() > this.playArea.max.z){
            rb.position.z = this.playArea.max.z - rb.getRadius();
            rb.velocity.z = rb.velocity.z * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
    
        }
        if(rb.position.z - rb.getRadius() < this.playArea.min.z){
            rb.position.z = this.playArea.min.z + rb.getRadius();
            rb.velocity.z = rb.velocity.z * -1;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        */
       if(rb1.intersects(rb2)){
        
        
        const radiuses = rb2.getRadius() + rb1.getRadius();
        const overlap = rb1.position.distanceTo(rb2.position);
        const overlapp = radiuses - overlap;
        if (overlapp > 0){
            const position1 = gfx.Vector3.subtract(rb1.position, rb2.position);
            position1.normalize();
            position1.multiplyScalar(overlapp * 0.5);
            rb1.position.add(position1);
            rb2.position.subtract(position1);
        
        }
        const velocity1 = gfx.Vector3.subtract(rb1.velocity, rb2.velocity);
        const velocity2 = gfx.Vector3.subtract(rb2.velocity, rb1.velocity);
        const norm1 = gfx.Vector3.subtract(rb1.position, rb2.position);
        const norm2 = gfx.Vector3.subtract(rb2.position, rb1.position);
        norm1.normalize();
        norm2.normalize();
        velocity1.normalize();
        velocity2.normalize();
        rb1.velocity = gfx.Vector3.reflect(velocity1, norm1);
        rb2.velocity = gfx.Vector3.reflect(velocity2, norm2);
        rb1.velocity.multiplyScalar(0.5);
        rb1.velocity.multiplyScalar(frictionSlowDown);
        rb2.velocity.multiplyScalar(0.5);
        rb2.velocity.multiplyScalar(frictionSlowDown);
       }


    }

    // This method handles collisions between the rigid body and the rim
    // of the hole. You do not need to modify this code
    handleRimCollision(rb: RigidBody, frictionSlowDown: number): void
    {
        // Compute the rigid body's position on the ground
        const rbOnGround = new gfx.Vector3(rb.position.x, 0, rb.position.z);

        // Figure out the closest point along the rim of the hole
        const rimPoint = gfx.Vector3.subtract(rbOnGround, this.hole.position);
        rimPoint.normalize();
        rimPoint.multiplyScalar(this.holeRadius);
        rimPoint.add(this.hole.position.clone());

        // If the rigid body is colliding with the point on the rim
        if(rb.position.distanceTo(rimPoint) < rb.getRadius())
        {
            // Correct the position of the rigid body so that it is no longer intersecting
            const correctionDistance = rb.getRadius() - rb.position.distanceTo(rimPoint) ;
            const correctionMovement = gfx.Vector3.subtract(rb.position, rimPoint);
            correctionMovement.normalize();
            correctionMovement.multiplyScalar(correctionDistance);
            rb.position.add(correctionMovement);

            // Compute the collision normal
            const rimNormal = gfx.Vector3.subtract(this.hole.position, rimPoint);
            rimNormal.normalize();

            // Reflect the velocity about the collision normal
            rb.velocity.reflect(rimNormal);

            // Slow down the velocity due to friction
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
    }

    // This method advances to the next stage of the game
    startNextStage(): void
    {
        // Create a test scene when the user presses start
        if(this.stage == 0)
        {
            this.textPlane.visible = false;
            
            const rb1 = new RigidBody(this.sphere);
            rb1.material = new gfx.GouraudMaterial();
            rb1.material.setColor(gfx.Color.RED);
            rb1.position.set(0, 0.25, 7.5);
            rb1.setRadius(0.25);
            rb1.velocity.set(0, 10, -4);
            this.rigidBodies.add(rb1);
    
            const rb2 = new RigidBody(this.sphere);
            rb2.material = new gfx.GouraudMaterial();
            rb2.material.setColor(gfx.Color.GREEN);
            rb2.position.set(-8, 1, -5);
            rb2.setRadius(0.5);
            rb2.velocity.set(4, 0, 0);
            this.rigidBodies.add(rb2);
    
            const rb3 = new RigidBody(this.sphere);
            rb3.material = new gfx.GouraudMaterial();
            rb3.material.setColor(gfx.Color.BLUE);
            rb3.position.set(8, 1, -4.5);
            rb3.setRadius(0.5);
            rb3.velocity.set(-9, 0, 0);
            this.rigidBodies.add(rb3);
    
            const rb4 = new RigidBody(this.sphere);
            rb4.material = new gfx.GouraudMaterial();
            rb4.material.setColor(gfx.Color.YELLOW);
            rb4.position.set(0, 0.25, -12);
            rb4.setRadius(0.5);
            rb4.velocity.set(15, 10, -20);
            this.rigidBodies.add(rb4);
        }
        // The user has finished the test scene
        else if(this.stage == 1)
        {
            this.textPlane.visible = false;
            this.setHoleRadius(0.5);

            const rb1 = new RigidBody(this.sphere);
            rb1.material = new gfx.GouraudMaterial();
            rb1.material.setColor(gfx.Color.PURPLE);
            rb1.position.set(10, 6, -12);
            rb1.setRadius(0.25);
            rb1.velocity.set(15, 5, -20);
            this.rigidBodies.add(rb1);

            const rb2 = new RigidBody(this.sphere);
            rb2.material = new gfx.GouraudMaterial();
            rb2.material.setColor(gfx.Color.PURPLE);
            rb2.position.set(10, 3, 7);
            rb2.setRadius(0.25);
            rb2.velocity.set(10, 2, 4);
            this.rigidBodies.add(rb2);

            const rb3 = new RigidBody(this.sphere);
            rb3.material = new gfx.GouraudMaterial();
            rb3.material.setColor(gfx.Color.PURPLE);
            rb3.position.set(10, 2, -15);
            rb3.setRadius(0.25);
            rb3.velocity.set(5, 2, -4);
            this.rigidBodies.add(rb3);

            const rb4 = new RigidBody(this.sphere);
            rb4.material = new gfx.GouraudMaterial();
            rb4.material.setColor(gfx.Color.PURPLE);
            rb4.position.set(10, 15, 0);
            rb4.setRadius(0.5);
            rb4.velocity.set(5, 5, -2);
            this.rigidBodies.add(rb4);

            const rb5 = new RigidBody(this.sphere);
            rb5.material = new gfx.GouraudMaterial();
            rb5.material.setColor(gfx.Color.PURPLE);
            rb5.position.set(10, 29, -15);
            rb5.setRadius(0.75);
            rb5.velocity.set(-42, 0, 7);
            this.rigidBodies.add(rb5);

            const rb6 = new RigidBody(this.sphere);
            rb6.material = new gfx.GouraudMaterial();
            rb6.material.setColor(gfx.Color.PURPLE);
            rb6.position.set(10, 3, 7);
            rb6.setRadius(1);
            rb6.velocity.set(7, 0, 0);
            this.rigidBodies.add(rb6);

            const rb7 = new RigidBody(this.sphere);
            rb7.material = new gfx.GouraudMaterial();
            rb7.material.setColor(gfx.Color.PURPLE);
            rb7.position.set(10, 24, 6);
            rb7.setRadius(1.25);
            rb7.velocity.set(4, -3, 10);
            this.rigidBodies.add(rb7);

            const rb8 = new RigidBody(this.sphere);
            rb8.material = new gfx.GouraudMaterial();
            rb8.material.setColor(gfx.Color.PURPLE);
            rb8.position.set(10, 2, 2);
            rb8.setRadius(1.5);
            rb8.velocity.set(-4, 0, -20);
            this.rigidBodies.add(rb8);

            const rb9 = new RigidBody(this.sphere);
            rb9.material = new gfx.GouraudMaterial();
            rb9.material.setColor(gfx.Color.CYAN);
            rb9.position.set(0, 0, 0);
            rb9.setRadius(1.75);
            rb9.velocity.set(0, 0, 0);
            this.rigidBodies.add(rb9);

            const rb10 = new RigidBody(this.sphere);
            rb10.material = new gfx.GouraudMaterial();
            rb10.material.setColor(gfx.Color.CYAN);
            rb10.position.set(5, 0, -5);
            rb10.setRadius(2.25);
            rb10.velocity.set(0, 0, 0);
            this.rigidBodies.add(rb10);

            /*
            const rb11 = new RigidBody(this.sphere);
            rb11.material = new gfx.GouraudMaterial();
            rb11.material.setColor(gfx.Color.CYAN);
            rb11.position.set(-5, 0, 5);
            rb11.setRadius(2.25);
            rb11.velocity.set(0, 0, 0);
            this.rigidBodies.add(rb11);
            */

            // PART 5: CREATE YOUR OWN GAME
            // In this part, you should create your own custom scene!  You should
            // refer the code above to see how rigid bodies were created for the
            // test scene. You have a lot of freedom to create your own game,
            // as long as it meets the minimum requirements in the rubric.  
            // Creativity is encouraged!
            /*
            for(let i=0.2; i < 1.5; i+=0.1)
            {
                const rb = new RigidBody(this.sphere);
                rb.setRadius(i);

                rb.material = new gfx.GouraudMaterial();
                rb.material.setColor(new gfx.Color(Math.random(), Math.random(), Math.random()));

                const playAreaSize = gfx.Vector3.subtract(this.playArea.max, this.playArea.min);
                playAreaSize.x -= 2;
                playAreaSize.z -= 2;

                rb.position.x = Math.random() * playAreaSize.x - playAreaSize.x/2;
                rb.position.y = rb.getRadius()/2;
                rb.position.z = Math.random() * playAreaSize.z - playAreaSize.z/2;

                rb.velocity.set(Math.random() * 50 - 25, Math.random() * 25, Math.random() * 50 - 25);

                this.rigidBodies.add(rb);
            }
            */
        }
        else if(this.stage == 2){

            this.textPlane.visible = false;
            this.setHoleRadius(0.5);
            for(let i=0.2; i < 2; i+=0.1)
            {
                const rb = new RigidBody(this.sphere);
                rb.setRadius(i);

                rb.material = new gfx.GouraudMaterial();
                rb.material.setColor(new gfx.Color(Math.random(), Math.random(), Math.random()));

                const playAreaSize = gfx.Vector3.subtract(this.playArea.max, this.playArea.min);
                playAreaSize.x -= 2;
                playAreaSize.z -= 2;

                rb.position.x = Math.random() * playAreaSize.x - playAreaSize.x/2;
                rb.position.y = rb.getRadius()/2;
                rb.position.z = Math.random() * playAreaSize.z - playAreaSize.z/2;

                rb.velocity.set(Math.random() * 50 - 25, Math.random() * 25, Math.random() * 50 - 25);

                this.rigidBodies.add(rb);
            }

            const rb9 = new RigidBody(this.sphere);
            rb9.material = new gfx.GouraudMaterial();
            rb9.material.setColor(gfx.Color.CYAN);
            rb9.position.set(0, 0, 0);
            rb9.setRadius(2.25);
            rb9.velocity.set(0, 0, 0);
            this.rigidBodies.add(rb9);
        
        }
        // The user has finished the game
        else
        {
            this.text.text = 'YOU WIN!';
            this.text.updateTextureImage();
            this.textPlane.visible = true;
            this.winSound.play();
        }

        this.stage++;
    }

    // Set the radius of the hole and update the scale of the
    // hole mesh so that it is displayed at the correct size.
    setHoleRadius(radius: number): void
    {
        this.holeRadius = radius;
        this.hole.scale.set(radius, 1, radius);
    }

    // Set the x or y components of the input vector when either
    // the WASD or arrow keys are pressed.
    onKeyDown(event: KeyboardEvent): void 
    {
        if(event.key == 'w' || event.key == 'ArrowUp')
            this.inputVector.y = 1;
        else if(event.key == 's' || event.key == 'ArrowDown')
            this.inputVector.y = -1;
        else if(event.key == 'a' || event.key == 'ArrowLeft')
            this.inputVector.x = -1;
        else if(event.key == 'd' || event.key == 'ArrowRight')
            this.inputVector.x = 1;
    }

    // Reset the x or y components of the input vector when either
    // the WASD or arrow keys are released.
    onKeyUp(event: KeyboardEvent): void 
    {
        if((event.key == 'w' || event.key == 'ArrowUp') && this.inputVector.y == 1)
            this.inputVector.y = 0;
        else if((event.key == 's' || event.key == 'ArrowDown') && this.inputVector.y == -1)
            this.inputVector.y = 0;
        else if((event.key == 'a' || event.key == 'ArrowLeft')  && this.inputVector.x == -1)
            this.inputVector.x = 0;
        else if((event.key == 'd' || event.key == 'ArrowRight')  && this.inputVector.x == 1)
            this.inputVector.x = 0;
    }

    // These mouse events are not necessary to play the game on a computer. However, they
    // are included so that the game is playable on touch screen devices without a keyboard.
    onMouseMove(event: MouseEvent): void 
    {
        // Only update the mouse position if only the left button is currently pressed down
        if(event.buttons == 1)
        {
            const mouseCoordinates = this.getNormalizedDeviceCoordinates(event.x, event.y);

            if(mouseCoordinates.x < -0.5)
                this.inputVector.x = -1;
            else if(mouseCoordinates.x > 0.5)
                this.inputVector.x = 1;

            if(mouseCoordinates.y < -0.5)
                this.inputVector.y = -1;
            else if(mouseCoordinates.y > 0.5)
                this.inputVector.y = 1;
        }
    }

    onMouseUp(event: MouseEvent): void
    {
        // Left mouse button
        if(event.button == 0)
            this.inputVector.set(0, 0);
    }

    onMouseDown(event: MouseEvent): void 
    {
        if(this.stage==0)
            this.startNextStage();
        else
            this.onMouseMove(event);
    }

}