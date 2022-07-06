import pandas as pd
import numpy as np

# Constant to use when we want to rule out messages
ZERO_PROBABILITY = 1e-10

class BaseSpeaker(object):

    def __init__(self, listener, beta, w, name):

        self.listener = listener
        self.beta = beta
        self.w = w
        self.name = name
    
    def utility(self, utterance, action_context):
        """Implemented on a per-speaker basis. Return the utility of an utterance w.r.t. some action context."""
        
        raise NotImplementedError

    def true_rewards(self, action_context):
        """Use the listener to estimate rewards of every action, using true reward function w."""

        return self.listener.estimate_rewards(self.w, action_context)

    def probability_optimal_action(self, utterance, action_context):

        listener_policy = self.listener.action_policy(utterance, action_context)
        listener_policy["true_rewards"] = self.true_rewards(listener_policy)
        highest_available_reward = listener_policy.true_rewards.max()
        optimal_actions = listener_policy[listener_policy.true_rewards == highest_available_reward]

        return optimal_actions["listener_choice_prob"].sum()

    def expected_rewards(self, utterance, action_context):

        listener_policy = self.listener.action_policy(utterance, action_context)
        listener_policy["true_rewards"] = self.true_rewards(listener_policy)

        return (listener_policy["listener_choice_prob"] * listener_policy["true_rewards"]).sum()


class BeliefSpeaker(BaseSpeaker):

    def utility(self, utterance, action_context):

        resulting_listener_beliefs = self.listener.beliefs(utterance)

        # Convert true rewards to a dataframe
        true_world = pd.DataFrame.from_records([self.w.to_dict()])

        # Join to the belief dataframe to select out the one true row
        true_row = pd.merge(resulting_listener_beliefs, true_world,
                            left_on=list(true_world.columns.values),
                            right_on=list(true_world.columns.values))

        # When this utterance is false, there will be no row. Return an extremely small value.
        if len(true_row) == 0:
            probability = ZERO_PROBABILITY
        else:
            probability = true_row.loc[0]["probability"]

        return np.log(probability)


class QUDBeliefSpeaker(BeliefSpeaker):
    """Intercept the utterance and make sure it refers to a feature present in the context."""

    def utility(self, utterance, action_context):

        # Get the list of features present in the action context
        # This entails extracting nonzero feature columns
        # https://stackoverflow.com/questions/21164910/how-do-i-delete-a-column-that-contains-only-zeros-in-pandas
        features_in_context = action_context.loc[:, (action_context != 0).any(axis=0)]
        features_in_context = list(features_in_context)

        # If we don't find this feature in the context, don't talk about it
        if utterance[0] not in features_in_context:
            return np.log(ZERO_PROBABILITY)

        # Otherwise, return base Belief speaker probability.
        return super().utility(utterance, action_context)


class ActionSpeaker(BaseSpeaker):

    def utility(self, utterance, action_context):
        return np.log(self.probability_optimal_action(utterance, action_context))

class CombinedSpeaker(BaseSpeaker):

    def utility(self, utterance, action_context):
        return self.expected_rewards(utterance, action_context)

class JointSpeaker(BaseSpeaker):

    def __init__(self, listener, beta, w, name, utilityWeight, valenceWeight=0):

        super().__init__(listener, beta, w, name)
        self.utilityWeight = utilityWeight
        self.valenceWeight = valenceWeight

    def utility(self, utterance, action_context):

        # We don't handle 0-value
        truthUtility = 1 if self.w.get(utterance[0]) == utterance[1] else -1
        rewardUtility = self.expected_rewards(utterance, action_context)
        valenceSign = 1 if utterance[1] > 0 else -1 if utterance[1] < 0 else 0
        valenceUtility = self.valenceWeight * valenceSign

        return self.utilityWeight * rewardUtility + (1-self.utilityWeight) * truthUtility + valenceUtility