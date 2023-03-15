import { Behaviour, CharacterController, Gizmos, serializeable } from "@needle-tools/engine";
import { Color, Ray, Vector3 } from "three";
import { RaycastOptions } from "@needle-tools/engine/engine/engine_physics";

const green = new Color(0,1,0);
const red = new Color(1,0,0);

export class ControlTest extends Behaviour{
    @serializeable()
    moveSpeed : number = 3;

    vertical: number = 0;
    horizontal: number = 0;
    speed: Vector3 = new Vector3();

    update(): void {
         //Input Gathering TODO could be its own global class / file. 
         const up = this.context.input.isKeyPressed("w") || this.context.input.isKeyPressed("ArrowUp");
         const down = this.context.input.isKeyPressed("s") || this.context.input.isKeyPressed("ArrowDown");
         const left = this.context.input.isKeyPressed("a") || this.context.input.isKeyPressed("ArrowLeft");
         const right = this.context.input.isKeyPressed("d") || this.context.input.isKeyPressed("ArrowRight");
        
        this.vertical = up? 1:0 + down? -1:0;
        this.horizontal = left ? 1:0 + right?-1:0;

        this.speed = new Vector3(this.horizontal, 0, this.vertical).multiplyScalar(this.moveSpeed*this.context.time.deltaTime);

        this.CheckOnlyForward();
        //this.CheckWithRays();
        //this.CheckWithSphere();

        this.gameObject.position.add(this.speed);
    }


    CheckOnlyForward(){
        const rayOrigin = new Vector3().copy(this.worldPosition);
        const speedForward = new Vector3().copy(this.speed).normalize();
        
      
        const options = new RaycastOptions();
        options.maxDistance = 15*this.speed.length()

        const rayForward = new Ray(rayOrigin, speedForward);
  

        const hitForward = this.context.physics.raycastFromRay(rayForward, options);
        Gizmos.DrawArrow(rayOrigin, new Vector3().addVectors(rayOrigin, new Vector3().copy(this.speed).multiplyScalar(30)), (hitForward.length>0 ? red : green));

        if(hitForward.length>0 ){
           
            this.speed = new Vector3();
        }

    }

    CheckWithSphere(){
        const spherePos = new Vector3().copy(this.worldPosition);
        const sphereHit = this.context.physics.sphereOverlap(spherePos, 1);
        Gizmos.DrawSphere(spherePos, 0.24, sphereHit.length>0?red:green);
        if(sphereHit.length>0){
            console.log(sphereHit);
            this.speed = new Vector3();
        } 
    }

    CheckWithRays(){
        const rayOrigin = new Vector3().copy(this.worldPosition);
        const speedForward = new Vector3().copy(this.speed).normalize();
        
        const speedRight = new Vector3().copy(speedForward).cross(new Vector3(0,1,0));//the right vector of this speed.
        const speedLeft = new Vector3().copy(speedRight).multiplyScalar(-1);//inverse for left vector.

        const options = new RaycastOptions();
        options.maxDistance = 5*this.speed.length()

        const rayForward = new Ray(rayOrigin, speedForward);
        const rayRight = new Ray(rayOrigin, speedRight);
        const rayLeft = new Ray(rayOrigin, speedLeft);

        const hitForward = this.context.physics.raycastFromRay(rayForward, options);
        const hitRight = this.context.physics.raycastFromRay(rayRight, options);
        const hitLeft= this.context.physics.raycastFromRay(rayLeft, options);

        Gizmos.DrawArrow(rayOrigin, new Vector3().addVectors(rayOrigin, new Vector3().copy(speedForward)), (hitForward.length>0 ? red : green));
        Gizmos.DrawArrow(rayOrigin, new Vector3().addVectors(rayOrigin, new Vector3().copy(speedRight)), (hitRight.length>0 ? red : green));
        Gizmos.DrawArrow(rayOrigin, new Vector3().addVectors(rayOrigin, new Vector3().copy(speedLeft)), (hitLeft.length>0 ? red : green));


        if(hitForward.length>0 || hitLeft.length>0 || hitRight.length>0){
            this.speed = new Vector3();
        }
    }
}