# Needle-Engine-Scene-Switching
A repository for testing of the Needle engine Scene switching capabilities. 

some caveats to take into account: 

- Having two gltfObject components nested and with the same name will cause problems. For example if you have a scene with a gltfObject called "sceneRoot" and one of the loaded scenes has another gltfObject with the same name it will cause issues. 
- In fact, the other scenes you are loading do not need to have an gltfObject or needle exporter component. they can just be Loose game objects. 

![needleSceneSwitchingExp](https://user-images.githubusercontent.com/2174663/223844552-5b51e0fd-7fe0-4a82-8502-ef6efc1b467d.jpg)

This is the example script that will result in being able to load multiple scenes in needle. the advantage of this is that we can leverage unity lightmaps for different scenes. 

    import { AssetReference, Behaviour, GameObject, serializeable, showBalloonMessage } from "@needle-tools/engine";
    import { InputEvents } from "@needle-tools/engine/engine/engine_input";
    import { getParam, setParamWithoutReload } from "@needle-tools/engine/engine/engine_utils";

    export class SceneSwitcherSample extends Behaviour {

      // tell the component compiler that we want to reference an array of SceneAssets
      // @type UnityEditor.SceneAsset[]
      @serializeable(AssetReference)
      scenes?: AssetReference[];

      private currentIndex: number = -1;
      private currentScene: AssetReference | undefined = undefined;

      start() {
          this.select(0);

          setInterval(() => {
              showBalloonMessage("Press \"a\" or \"d\" keys to switch between the scenes or use the numbers 1 2 3");
          }, 3000);

          this.context.input.addEventListener(InputEvents.KeyDown, (e: any) => {
              if (!this.scenes) return;
              const key = e.key;
              if (!key) return;
              const index = parseInt(key) - 1;
              if (index >= 0) {
                  if (index < this.scenes.length) {
                      this.select(index);
                  }
              }
              switch (e.key) {
                  case "d":
                      this.selectNext();
                      break;
                  case "a":
                      this.selectPrev();
                      break;
              }
          });

          // try restore the level from the url
          const level = getParam("level");
          if (typeof level === "string") {
              const index = parseInt(level as string);
              this.select(index);
          }
          else this.select(0);

      }

      selectNext() {
          this.select(this.currentIndex + 1);
      }

      selectPrev() {
          this.select(this.currentIndex - 1);
      }

      select(index: number) {
          if (!this.scenes?.length) return;
          if (index < 0) index = this.scenes.length - 1;
          if (index >= this.scenes.length) index = 0;
          const scene = this.scenes[index];
          this.switchScene(scene);
      }

      async switchScene(scene: AssetReference) {
          if (scene === this.currentScene) return;
          if (this.currentScene)
              GameObject.remove(this.currentScene.asset);
          const index = this.currentIndex = this.scenes?.indexOf(scene) ?? -1;
          this.currentScene = scene;
          await scene.loadAssetAsync();
          if (!scene.asset) return;
          if (this.currentIndex === index) {
              showBalloonMessage(`Switched to scene ${index + 1}`);
              GameObject.add(scene.asset, this.gameObject);
              // save the loaded level as an url parameter
              setParamWithoutReload("level", index.toString());
          }
      }
    } 
