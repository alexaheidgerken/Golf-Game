/* Assignment 2: Hole in the Ground
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'

export class RigidBody extends gfx.MeshInstance
{
    // Parameter to approximate downward acceleration due to gravity
    public static gravity = -10;

    // The current velocity of the rigid body
    public velocity: gfx.Vector3;

    // The current radius of the rigid body's collision sphere
    private radius: number;

    constructor(baseMesh: gfx.Mesh)
    {   
        super(baseMesh);
        this.velocity = new gfx.Vector3();
        this.radius = baseMesh.boundingSphere.radius;
    }

    update(deltaTime: number): void
    {

        
        // PART 2: RIGID BODY PHYSICS
        // In this part, you should use the formulas described in class to
        // 1. Compute the acceleration vector a
        // 2. Update the velocity, v' = v + a * dt
        // 3. Update the position, p' = p + v * dt
        
        // ADD YOUR CODE HERE
        //const a = new gfx.Vector3(1, 0.5, 0);
        if(this.velocity.length() == 0)
            return;
        const a = new gfx.Vector3(0, RigidBody.gravity, 0);
        this.velocity.add(gfx.Vector3.multiplyScalar(a, deltaTime));
        this.position.add(gfx.Vector3.multiplyScalar(this.velocity, deltaTime));
    }

    // Use this method to set the radius of the collision sphere.  This will also
    // properly scale the object that it is displayed within the collision sphere.
    setRadius(radius: number): void
    {
        this.radius = radius;
        
        const scaleFactor = this.radius / this.baseMesh.boundingSphere.radius;
        this.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    // Get the current radius of the collision sphere.
    getRadius(): number
    {
        return this.radius;
    }
}
