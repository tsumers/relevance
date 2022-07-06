var jsPsychFullscreen = (function (jspsych) {
  'use strict';

  const info = {
      name: "fullscreen",
      parameters: {
          /** If true, experiment will enter fullscreen mode. If false, the browser will exit fullscreen mode. */
          fullscreen_mode: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Fullscreen mode",
              default: true,
              array: false,
          },
          /** HTML content to display above the button to enter fullscreen mode */
          message: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Message",
              default: "<p>The experiment will switch to full screen mode when you press the button below</p>",
              array: false,
          },
          /** The text that appears on the button to enter fullscreen */
          button_label: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Button label",
              default: "Continue",
              array: false,
          },
          /** The length of time to delay after entering fullscreen mode before ending the trial. */
          delay_after: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Delay after",
              default: 1000,
              array: false,
          },
      },
  };
  /**
   * **fullscreen**
   *
   * jsPsych plugin for toggling fullscreen mode in the browser
   *
   * @author Josh de Leeuw
   * @see {@link https://www.jspsych.org/plugins/jspsych-fullscreen/ fullscreen plugin documentation on jspsych.org}
   */
  class FullscreenPlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
          const endTrial = () => {
              display_element.innerHTML = "";
              this.jsPsych.pluginAPI.setTimeout(() => {
                  var trial_data = {
                      success: !keyboardNotAllowed,
                  };
                  this.jsPsych.finishTrial(trial_data);
              }, trial.delay_after);
          };
          // check if keys are allowed in fullscreen mode
          var keyboardNotAllowed = typeof Element !== "undefined" && "ALLOW_KEYBOARD_INPUT" in Element;
          if (keyboardNotAllowed) {
              // This is Safari, and keyboard events will be disabled. Don't allow fullscreen here.
              // do something else?
              endTrial();
          }
          else {
              if (trial.fullscreen_mode) {
                  display_element.innerHTML =
                      trial.message +
                          '<button id="jspsych-fullscreen-btn" class="jspsych-btn">' +
                          trial.button_label +
                          "</button>";
                  display_element
                      .querySelector("#jspsych-fullscreen-btn")
                      .addEventListener("click", () => {
                      var element = document.documentElement;
                      if (element.requestFullscreen) {
                          element.requestFullscreen();
                      }
                      else if (element["mozRequestFullScreen"]) {
                          element["mozRequestFullScreen"]();
                      }
                      else if (element["webkitRequestFullscreen"]) {
                          element["webkitRequestFullscreen"]();
                      }
                      else if (element["msRequestFullscreen"]) {
                          element["msRequestFullscreen"]();
                      }
                      endTrial();
                  });
              }
              else {
                  if (document.fullscreenElement ||
                      document["mozFullScreenElement"] ||
                      document["webkitFullscreenElement"]) {
                      if (document.exitFullscreen) {
                          document.exitFullscreen();
                      }
                      else if (document["msExitFullscreen"]) {
                          document["msExitFullscreen"]();
                      }
                      else if (document["mozCancelFullScreen"]) {
                          document["mozCancelFullScreen"]();
                      }
                      else if (document["webkitExitFullscreen"]) {
                          document["webkitExitFullscreen"]();
                      }
                  }
                  endTrial();
              }
          }
      }
  }
  FullscreenPlugin.info = info;

  return FullscreenPlugin;

})(jsPsychModule);
