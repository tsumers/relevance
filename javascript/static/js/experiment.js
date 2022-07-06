
async function initializeExperiment() {

    // Discourage refreshing the page
    // See https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
    EXPERIMENT_COMPLETED = false
    window.addEventListener('beforeunload', function (e) {

        if(!EXPERIMENT_COMPLETED) {
            // Cancel the event
            e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
            // Chrome requires returnValue to be set
            e.returnValue = '';
        }

    });

    ///////////
    // Setup //
    ///////////

    var jsPsych = startExperiment({
    exclusions: {
      min_width: 800,
      min_height: 600
    },
    });

    const exp1ConditionEnum = {
        0: {"objective": "ambiguous", "trial_type": "select", "horizon": "ambiguous"},
        1: {"objective": "utility", "trial_type": "select", "horizon": "ambiguous"},
        2: {"objective": "belief", "trial_type": "select", "horizon": "ambiguous"},
    }

    const exp2ConditionEnum = {
        0: {"objective": "ambiguous", "trial_type": "slider", "horizon": "ambiguous"},
        1: {"objective": "utility", "trial_type": "slider", "horizon": "ambiguous"},
        2: {"objective": "belief", "trial_type": "slider", "horizon": "ambiguous"},
    }

    const exp3ConditionEnum = {
        0: {"objective": "ambiguous", "trial_type": "slider", "horizon": 1},
        1: {"objective": "ambiguous", "trial_type": "slider", "horizon": 2},
        2: {"objective": "ambiguous", "trial_type": "slider", "horizon": 4},
    }

    const conditionEnum = exp1ConditionEnum

    let participantCondition = conditionEnum[CONDITION];
    // let participantCondition = {"objective": "utility", "trial_type": "slider", "horizon": "ambiguous"};
    psiturk.recordUnstructuredData("condition", JSON.stringify(participantCondition))
    console.log(participantCondition)

    /////////////////
    // Load trials //
    /////////////////

    let trialDataFile;
    switch (participantCondition["trial_type"]) {
        case "select":
            // Choose split 1, 2, or 3 (random split of all 84 trials)
            trialDataFile = _.sample(["exp1_split1", "exp1_split2", "exp1_split3"])
            break;
        case "slider":
            trialDataFile = _.sample(["exp2_split1", "exp2_split2", "exp2_split3", "exp2_split4"])
    }
    let trials = await $.getJSON(`static/json/${trialDataFile}.json`)
    psiturk.recordUnstructuredData("trialDataFile", trialDataFile)
    console.log("Using data file: " + trialDataFile)

    const catchTrialDir = 'static/json/catch_trials/'
    const stripedEasyCatchTrials = await $.getJSON(catchTrialDir + 'striped-easy.json')
    const spottedEasyCatchTrials = await $.getJSON(catchTrialDir + 'spotted-easy.json')
    catchTrials = stripedEasyCatchTrials.concat(spottedEasyCatchTrials)
    trials = jsPsych.randomization.shuffle(trials.concat(catchTrials))

    //////////////////////////////
    // Strings and Quiz Answers //
    //////////////////////////////

    LYING_ALLOWED_BELIEF = "No, lying is not allowed"
    MUSHROOM_CHOICE_BELIEF = "No, it doesn't matter what mushrooms they choose"
    LYING_ALLOWED_UTILITY = "Yes, lying is allowed"
    MUSHROOM_CHOICE_UTILITY = "Yes, we want them to choose tasty mushrooms"

    switch(participantCondition["objective"]) {
        case "utility":
            MESSAGE_PROMPT_SELECT = "What would make them choose a good mushroom?"
            MESSAGE_PROMPT_SLIDER = "Remember, you should <i>ensure tourists choose good mushrooms</i>.<br>"

            // correct answers for quiz
            TOUR_GUIDE_OBJECTIVE = "Make sure tourists choose the tastiest mushrooms"
            LYING_ALLOWED_ANSWER = LYING_ALLOWED_UTILITY
            MUSHROOM_CHOICE_ANSWER = MUSHROOM_CHOICE_UTILITY
            break;

        case "belief":
            MESSAGE_PROMPT_SELECT = "What is a true fact you could say?"
            MESSAGE_PROMPT_SLIDER = "Remember, you should <i>always and only say true things</i>.<br>"

            // correct answers for quiz
            TOUR_GUIDE_OBJECTIVE = "Teach the tourists facts about mushroom features"
            LYING_ALLOWED_ANSWER = LYING_ALLOWED_BELIEF
            MUSHROOM_CHOICE_ANSWER = MUSHROOM_CHOICE_BELIEF
            break;

        case "ambiguous":
            MESSAGE_PROMPT_SELECT = "What would you say?"
            MESSAGE_PROMPT_SLIDER = ""

    }

    switch(participantCondition["horizon"]) {
        case "ambiguous":
            NUMBER_OF_PATCHES_STRING = "Tourists always pick <strong>one mushroom per patch.</strong><br>"
            MUSHROOM_PATCHES_QUESTION = "How many mushrooms are in a patch?"
            MUSHROOM_PATCH_PROMPT = "is visiting this mushroom patch."
            break;
        case 1:
            NUMBER_OF_PATCHES_STRING = "Tourists always visit <strong>one mushroom patch</strong> and pick <strong>one mushroom</strong> from it.<br>"
            MUSHROOM_PATCHES_QUESTION = "How many patches do tourists visit?"
            MUSHROOM_PATCH_PROMPT = "is <i>only</i> visiting this mushroom patch."
            break;
        case 2:
            NUMBER_OF_PATCHES_STRING = "Tourists visit <strong>two mushroom patches</strong> and pick <strong>one mushroom</strong> from each.<br>"
            MUSHROOM_PATCHES_QUESTION = "How many patches do tourists visit?"
            MUSHROOM_PATCH_PROMPT = "is visiting two mushroom patches. <br>But you only know one of them."
            break;
        case 4:
            NUMBER_OF_PATCHES_STRING = "Tourists visit <strong>four mushroom patches</strong> and pick <strong>one mushroom</strong> from each.<br>"
            MUSHROOM_PATCHES_QUESTION = "How many patches do tourists visit?"
            MUSHROOM_PATCH_PROMPT = "is visiting four mushroom patches. <br>But you only know one of them."
    }

    ///////////////////////////
    // Preload static images //
    ///////////////////////////

    jsPsych.pluginAPI.preloadImages(
      [
        'static/images/fungal-forest.jpg',
        'static/images/mushroom-picker.jpg',
        'static/images/mushroom-intro-rainbow.png',
        'static/images/mushroom-basket.png'
      ]);

    let tourists = jsPsych.randomization.shuffle(["Aiden", "Andrea", "Anne", "Avery", "Carla", "Charlotte",
        "Chloe", "Daniel", "Ethan", "Evelyn", "James", "Kelly", "Logan", "Mary", "Michael", "Sam", "Steve", "Thomas"])

    let peopleImageURLs = tourists.map(x => `static/images/people/${x}.png`)
    jsPsych.pluginAPI.preloadImages(peopleImageURLs);

    // Extend "tourists" until it's longer than the number of trials
    let touristArray = []
    while (touristArray.length < trials.length) {touristArray = touristArray.concat(_.shuffle(tourists))}

    console.log(`People array: ${touristArray.length}; trial array: ${trials.length}`)
    console.log("Started Experiment - Condition: " + CONDITION)

    ///////////////////////////
    // Feature Randomization //
    ///////////////////////////

    canonicalFeatureValues = {"Green": 2, "Red": 0, "Blue": -2, "Spotted":1, "Solid": 0, "Striped":-1}

    // define features
    let colors = ['Green', 'Red', 'Blue']
    let textures = ['Spotted', 'Solid', 'Striped']

    // Randomize:
    // --order of features (this determines which individual feature is neg/zero/pos)
    // --feature sets (this determines whether color or texture is high magnitude)
    let features = jsPsych.randomization.shuffle([
        jsPsych.randomization.shuffle(colors),
        jsPsych.randomization.shuffle(textures)]
    )

    let shuffledHighFeature = features[0]
    let shuffledLowFeature = features[1]

    // Write the results into our featureRandomization for use throughout experiment
    featureRandomization = {
        'Green': shuffledHighFeature[0],
        'Red': shuffledHighFeature[1],
        'Blue': shuffledHighFeature[2],
        'Spotted': shuffledLowFeature[0],
        'Solid': shuffledLowFeature[1],
        'Striped': shuffledLowFeature[2]
    }

    if (DEBUG) {
        console.log("DEBUG mode - default colors set.")
        featureRandomization = {
            'Green': 'Green',
            'Red': 'Red',
            'Blue': 'Blue',
            'Spotted': 'Spotted',
            'Solid': 'Solid',
            'Striped': 'Striped'
        }
    }

    psiturk.recordUnstructuredData("featureRandomization", JSON.stringify(featureRandomization))

    ///////////////////////
    // Build reused HTML //
    ///////////////////////

    all_feature_select = `<select name="feature" id="feature-select" required>
    <option selected value="" disabled>--Select a Feature--</option>`
    // reshuffle features so there isn't a consistent ordering (e.g. positive features aren't always at top)
    let reshuffledColors = _.shuffle(colors)
    let reshuffledTextures = _.shuffle(textures)

    // We *randomize* the displayed text, but *record* canonical features.
    // This way the backend *only* ever sees canonical features.
    reshuffledColors.forEach(color => all_feature_select += `<option value=${color}>${featureRandomization[color]}</option>`);
    reshuffledTextures.forEach(texture => all_feature_select += `<option value=${texture}>${featureRandomization[texture]}</option>`);
    all_feature_select += `</select>`

    // "Select" for values
    values_array = [-2, -1, 0, 1, 2]
    // Randomly reverse ordering so will sometimes go pos --> neg or vice versa
    if (Math.random() > .5) {values_array = values_array.reverse()}
    all_value_select = `<select name="feature_value" id="value-select" required>
    <option selected value="" disabled>--Select a Value--</option>`
    values_array.forEach(n => all_value_select += `<option value=${n}>${(n<=0?"":"+") + n}</option>`)
    all_value_select += `</select>`

    ///////////////////////////
    // Instructions and Quiz //
    ///////////////////////////

    QUIZ_QUESTIONS_CORRECT = 0
    QUIZ_QUESTIONS_TOTAL = 0
    QUIZ_TRIES_REMAINING = 3
    PASSED_QUIZ = false

    function introBlock(repetition) {
        return {
            timeline: [
                instructionsBlock(repetition, participantCondition),
                quizBlock(jsPsych, participantCondition),
                quizGradingPage(jsPsych)
            ],
            conditional_function: function () {return !PASSED_QUIZ}
        }
    }

  /////////////////
  // Test trials //
  /////////////////

    function generatejsPsychTrial(trialData, participantCondition) {

        switch(trialData.trial_type) {

            case "select":
                return generatejsPsychSelectTrial(trialData)
            case "button":
                // Catch trials vary by condition
                switch (participantCondition["trial_type"]) {

                    case "slider":
                        return generatejsPsychCatchEndorsementTrial(trialData, participantCondition)

                    case "select":
                        return generatejsPsychCatchSelectTrial(trialData)

                    default:
                        console.error("Unable to determine catch trial type.")
                        return generatejsPsychCatchEndorsementTrial(trialData)

                }
            case "slider":
                return generatejsPsychSliderTrial(trialData, participantCondition)
            default:
                console.error("Unable to determine trial type.")
                return generatejsPsychSelectTrial(trialData)

        }
    }

    function generatejsPsychSelectTrial(trialData){

        let feature_value_form = `${all_feature_select}&nbsp;&nbsp;&nbsp;is&nbsp;&nbsp;&nbsp;${all_value_select}<br><br><br>`

          // For use in multi-patch trials
        // const integerToWords = {1: "one", 2: "two", 3: "three", 4: "four"}
        // const numPatches = integerToWords[trialData["action_context"].length]
        // <p>${person} is visiting <em>${numPatches}</em> mushroom patch(es).<br><br>

        let person = touristArray.shift();

        var multiPatchMushroomDisplay = markdown(`
        <div class='center flex-person-wrap'>
            <img src="/static/images/people/${person}.png" width=100px>
            <p>${person} ${MUSHROOM_PATCH_PROMPT}<br>
            ${MESSAGE_PROMPT_SELECT}</p>
        </div>
        <div class='center'>
        ${patchListToHTML(trialData["action_context"])}
        ${mushroomModal()}
        </div>`)

        return {
            type: jsPsychSurveyHtmlForm,
            preamble: multiPatchMushroomDisplay,
            html: feature_value_form,
            data: trialData
        };
    }

    function generatejsPsychCatchEndorsementTrial(trialData, participantCondition){

        let person = touristArray.shift();

        var utteranceString = `<strong>"${featureRandomization[trialData.features[0]]} is 
                                        ${(trialData.values[0]<=0?"":"+") + trialData.values[0]}"</strong>`

        let utteranceSelect = `<select name="utterance" id="utterance-select" required>
                                    <option selected value="" disabled>--Select an Option--</option>
                                    <option value=0>Say <strong>Nothing</strong></option>
                                    <option value=1>Say ${utteranceString}</option>
                                </select><br><br>
                                If you say nothing, ${person} will choose a mushroom randomly.<br>
                                ${MESSAGE_PROMPT_SLIDER}<br>
        
                           `
        var mushroomPatches = expandPatchToHorizon(trialData["action_context"], participantCondition["horizon"])

        var multiPatchMushroomDisplay = markdown(`
        <div class='center flex-person-wrap'>
            <img src="/static/images/people/${person}.png" width=100px>
            <p>${person} ${MUSHROOM_PATCH_PROMPT}<br>
            Would you say this or stay silent?<br>
            <br>
            ${utteranceString}
            </p>
        </div>
        <div class='center'>
        ${patchListToHTML(mushroomPatches)}
        ${mushroomModal()}
        </div>`)

        return {
            type: jsPsychSurveyHtmlForm,
            preamble: multiPatchMushroomDisplay,
            html: utteranceSelect,
            data: trialData
        };
    }

    function generatejsPsychCatchSelectTrial(trialData){

        let person = touristArray.shift();

        var featureString = `<strong>${featureRandomization[trialData.features[0]]}</strong>`

        let endorsementVal = trialData.values[0]
        let silentVal = -endorsementVal

        let endorsementValSelect = `<option value=1>${(endorsementVal<=0?"":"+") + endorsementVal}</option>`
        let silentValSelect = `<option value=0>${(silentVal<=0?"":"+") + silentVal}</option>`

        let utteranceValuesArray = []
        // Keep ordering consistent with normal value select (randomized per-participant)
        if (values_array.indexOf(endorsementVal) < values_array.indexOf(silentVal)) {
            utteranceValuesArray = [endorsementValSelect, silentValSelect]
        } else {
            utteranceValuesArray = [silentValSelect, endorsementValSelect]
        }

        let valueSelect = `<select name="utterance" id="utterance-select" required>
                                    <option selected value="" disabled>--Select a Value--</option>`
        for (let i = 0; i < utteranceValuesArray.length; i++) {
            valueSelect += utteranceValuesArray[i]
        }
        valueSelect += `</select><br><br>`

        let featureValueForm = `${featureString}&nbsp;&nbsp;&nbsp;is&nbsp;&nbsp;&nbsp;${valueSelect}<br>`

        var multiPatchMushroomDisplay = markdown(`
        <div class='center flex-person-wrap'>
            <img src="/static/images/people/${person}.png" width=100px>
            <p>${person} ${MUSHROOM_PATCH_PROMPT}<br>
            <br>
            ${MESSAGE_PROMPT_SELECT}<br>
            </p>
        </div>
        <div class='center'>
        ${patchListToHTML(trialData["action_context"])}
        ${mushroomModal()}
        </div>`)

        return {
            type: jsPsychSurveyHtmlForm,
            preamble: multiPatchMushroomDisplay,
            html: featureValueForm,
            data: trialData
        };
    }

    function generatejsPsychSliderTrial(trialData, participantCondition){

        let person = touristArray.shift();

        var utteranceString = `<strong>"${featureRandomization[trialData.features[0]]} is 
                                        ${(trialData.values[0]<=0?"":"+") + trialData.values[0]}"</strong>`

        var mushroomPatches = expandPatchToHorizon(trialData["action_context"], participantCondition["horizon"])

        var multiPatchMushroomDisplay = `
        <div class='center flex-person-wrap'>
            <img src="/static/images/people/${person}.png" width=100px>
            <p>${person} ${MUSHROOM_PATCH_PROMPT}<br>
             Would you say this or stay silent?<br>
             <br>
             ${utteranceString}</p>
        </div>
        <div class='center'>
        ${patchListToHTML(mushroomPatches)}
        ${mushroomModal()}
        </div><br>`

        return {
            type: jsPsychHtmlSliderResponse,
            stimulus: multiPatchMushroomDisplay,
            labels: [`Definitely Say<br><strong>Nothing</strong>`, `|`, `Definitely Say<br>${utteranceString}`],
            prompt: `If you say nothing, ${person} will choose a mushroom randomly.<br>${MESSAGE_PROMPT_SLIDER}<br>`,
            require_movement: true,
            slider_width: 400,
            data: trialData
        };

    }


  /////////////////
  // Debrief     //
  /////////////////

    var debrief_block = {
        type: jsPsychSurveyText,
        preamble: `<strong>Thank you for playing!</strong><br>
            <br>           
            <strong>You will be paid the full bonus.</strong>
            <br><br>
            Please take this quick survey to help <strong>improve the experience for future participants!</strong>
            `,
        questions: [
            {
                prompt: "What was your objective as a tour guide?",
                name: "experiment_objective",
                required: true
            },
            {
                prompt: "What was your strategy to accomplish your objective?",
                name: "participant_strategy",
                required: true
            },
            {
                prompt: "Was anything about the experiment unclear or confusing?",
                name: "experiment_confusing",
                required: true
            },
            {
                prompt: "Do you have any other thoughts or feedback?",
                name: "misc_feedback",
                required: true
            }
        ],
        button_label: "Finish Experiment",
        on_finish: function() {

            psiturk.recordUnstructuredData('bonus', 2.00)
            EXPERIMENT_COMPLETED = true

        }

    };


  /////////////////////////
  // Experiment timeline //
  /////////////////////////

    var timeline = []
    timeline.push(welcomeInstructions());
    timeline.push(introBlock(0));
    //
    // // If they fail the first time...
    timeline.push(introBlock(1));
    timeline.push(introBlock(2));

    for (let i = 0; i < trials.length; i++) {
        timeline.push(generatejsPsychTrial(trials[i], participantCondition));
    }
    timeline.push(debrief_block);

    return jsPsych.run(timeline);

}


