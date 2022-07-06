var jsPsychVisualSearchCircle = (function (jspsych) {
  'use strict';

  const info = {
      name: "visual-search-circle",
      parameters: {
          /** The target image to be displayed. This must specified when using the target, foil and set_size parameters to define the stimuli set, rather than the stimuli parameter. */
          target: {
              type: jspsych.ParameterType.IMAGE,
              pretty_name: "Target",
              default: null,
          },
          /** The image to use as the foil/distractor. This must specified when using the target, foil and set_size parameters to define the stimuli set, rather than the stimuli parameter. */
          foil: {
              type: jspsych.ParameterType.IMAGE,
              pretty_name: "Foil",
              default: null,
          },
          /** How many items should be displayed, including the target when target_present is true? This must specified when using the target, foil and set_size parameters to define the stimuli set, rather than the stimuli parameter. */
          set_size: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Set size",
              default: null,
          },
          /** Array containing one or more image files to be displayed. This only needs to be specified when NOT using the target, foil, and set_size parameters to define the stimuli set. */
          stimuli: {
              type: jspsych.ParameterType.IMAGE,
              pretty_name: "Stimuli",
              default: null,
              array: true,
          },
          /**
           * Is the target present?
           * When using the target, foil and set_size parameters, false means that the foil image will be repeated up to the set_size,
           * and if true, then the target will be presented along with the foil image repeated up to set_size - 1.
           * When using the stimuli parameter, this parameter is only used to determine the response accuracy.
           */
          target_present: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Target present",
              default: undefined,
          },
          /** Path to image file that is a fixation target. */
          fixation_image: {
              type: jspsych.ParameterType.IMAGE,
              pretty_name: "Fixation image",
              default: undefined,
          },
          /** Two element array indicating the height and width of the search array element images. */
          target_size: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Target size",
              array: true,
              default: [50, 50],
          },
          /** Two element array indicating the height and width of the fixation image. */
          fixation_size: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Fixation size",
              array: true,
              default: [16, 16],
          },
          /** The diameter of the search array circle in pixels. */
          circle_diameter: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Circle diameter",
              default: 250,
          },
          /** The key to press if the target is present in the search array. */
          target_present_key: {
              type: jspsych.ParameterType.KEY,
              pretty_name: "Target present key",
              default: "j",
          },
          /** The key to press if the target is not present in the search array. */
          target_absent_key: {
              type: jspsych.ParameterType.KEY,
              pretty_name: "Target absent key",
              default: "f",
          },
          /** The maximum duration to wait for a response. */
          trial_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Trial duration",
              default: null,
          },
          /** How long to show the fixation image for before the search array (in milliseconds). */
          fixation_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Fixation duration",
              default: 1000,
          },
      },
  };
  /**
   * **visual-search-circle**
   *
   * jsPsych plugin to display a set of objects, with or without a target, equidistant from fixation.
   * Subject responds with key press to whether or not the target is present.
   * Based on code written for psychtoolbox by Ben Motz.
   *
   * @author Josh de Leeuw
   * @see {@link https://www.jspsych.org/plugins/jspsych-visual-search-circle/ visual-search-circle plugin documentation on jspsych.org}
   **/
  class VisualSearchCirclePlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
          // circle params
          var diam = trial.circle_diameter; // pixels
          var radi = diam / 2;
          var paper_size = diam + trial.target_size[0];
          // stimuli width, height
          var stimh = trial.target_size[0];
          var stimw = trial.target_size[1];
          var hstimh = stimh / 2;
          var hstimw = stimw / 2;
          // fixation location
          var fix_loc = [
              Math.floor(paper_size / 2 - trial.fixation_size[0] / 2),
              Math.floor(paper_size / 2 - trial.fixation_size[1] / 2),
          ];
          // check for correct combination of parameters and create stimuli set
          var possible_display_locs;
          var to_present = [];
          if (trial.target !== null && trial.foil !== null && trial.set_size !== null) {
              possible_display_locs = trial.set_size;
              if (trial.target_present) {
                  for (var i = 0; i < trial.set_size - 1; i++) {
                      to_present.push(trial.foil);
                  }
                  to_present.push(trial.target);
              }
              else {
                  for (var i = 0; i < trial.set_size; i++) {
                      to_present.push(trial.foil);
                  }
              }
          }
          else if (trial.stimuli !== null) {
              possible_display_locs = trial.stimuli.length;
              to_present = trial.stimuli;
          }
          else {
              console.error("Error in visual-search-circle plugin: you must specify an array of images via the stimuli parameter OR specify the target, foil and set_size parameters.");
          }
          // possible stimulus locations on the circle
          var display_locs = [];
          var random_offset = Math.floor(Math.random() * 360);
          for (var i = 0; i < possible_display_locs; i++) {
              display_locs.push([
                  Math.floor(paper_size / 2 + cosd(random_offset + i * (360 / possible_display_locs)) * radi - hstimw),
                  Math.floor(paper_size / 2 - sind(random_offset + i * (360 / possible_display_locs)) * radi - hstimh),
              ]);
          }
          // get target to draw on
          display_element.innerHTML +=
              '<div id="jspsych-visual-search-circle-container" style="position: relative; width:' +
                  paper_size +
                  "px; height:" +
                  paper_size +
                  'px"></div>';
          var paper = display_element.querySelector("#jspsych-visual-search-circle-container");
          const show_fixation = () => {
              // show fixation
              //var fixation = paper.image(trial.fixation_image, fix_loc[0], fix_loc[1], trial.fixation_size[0], trial.fixation_size[1]);
              paper.innerHTML +=
                  "<img src='" +
                      trial.fixation_image +
                      "' style='position: absolute; top:" +
                      fix_loc[0] +
                      "px; left:" +
                      fix_loc[1] +
                      "px; width:" +
                      trial.fixation_size[0] +
                      "px; height:" +
                      trial.fixation_size[1] +
                      "px;'></img>";
              // wait
              this.jsPsych.pluginAPI.setTimeout(() => {
                  // after wait is over
                  show_search_array();
              }, trial.fixation_duration);
          };
          const end_trial = (rt, correct, key_press) => {
              // data saving
              var trial_data = {
                  correct: correct,
                  rt: rt,
                  response: key_press,
                  locations: display_locs,
                  target_present: trial.target_present,
                  set_size: trial.set_size,
              };
              // go to next trial
              this.jsPsych.finishTrial(trial_data);
          };
          show_fixation();
          const show_search_array = () => {
              for (var i = 0; i < display_locs.length; i++) {
                  paper.innerHTML +=
                      "<img src='" +
                          to_present[i] +
                          "' style='position: absolute; top:" +
                          display_locs[i][0] +
                          "px; left:" +
                          display_locs[i][1] +
                          "px; width:" +
                          trial.target_size[0] +
                          "px; height:" +
                          trial.target_size[1] +
                          "px;'></img>";
              }
              var trial_over = false;
              const after_response = (info) => {
                  trial_over = true;
                  var correct = false;
                  if ((this.jsPsych.pluginAPI.compareKeys(info.key, trial.target_present_key) &&
                      trial.target_present) ||
                      (this.jsPsych.pluginAPI.compareKeys(info.key, trial.target_absent_key) &&
                          !trial.target_present)) {
                      correct = true;
                  }
                  clear_display();
                  end_trial(info.rt, correct, info.key);
              };
              var valid_keys = [trial.target_present_key, trial.target_absent_key];
              const key_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
                  callback_function: after_response,
                  valid_responses: valid_keys,
                  rt_method: "performance",
                  persist: false,
                  allow_held_key: false,
              });
              if (trial.trial_duration !== null) {
                  this.jsPsych.pluginAPI.setTimeout(() => {
                      if (!trial_over) {
                          this.jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);
                          trial_over = true;
                          var rt = null;
                          var correct = false;
                          var key_press = null;
                          clear_display();
                          end_trial(rt, correct, key_press);
                      }
                  }, trial.trial_duration);
              }
              function clear_display() {
                  display_element.innerHTML = "";
              }
          };
          // helper function for determining stimulus locations
          function cosd(num) {
              return Math.cos((num / 180) * Math.PI);
          }
          function sind(num) {
              return Math.sin((num / 180) * Math.PI);
          }
      }
  }
  VisualSearchCirclePlugin.info = info;

  return VisualSearchCirclePlugin;

})(jsPsychModule);
