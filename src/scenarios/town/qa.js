// Town hall cards for Scenario 5. The town, the plant and the base are fictional.
// PLACEHOLDER ANSWERS for the team to review and rewrite: the person who holds the information answers;
// anyone else points to who does.

export const INVITES = [
  { id: 'friend', label: 'A friend', brings: 'Company, and someone who’ll tell the street what happened.' },
  { id: 'mayor', label: 'The mayor', brings: 'Can put a measure to a vote.' },
  { id: 'teacher', label: 'A teacher', brings: 'Brings a class of students.' },
  { id: 'plant', label: 'The plant manager', brings: 'Can answer for the plant’s site.' },
  { id: 'base', label: 'A representative from the base', brings: 'Can answer for the base’s site.' },
  { id: 'nonprofit', label: 'A local nonprofit organizer', brings: 'Brings independent test data.' },
  { id: 'utility', label: 'The utility’s engineer', brings: 'Brings the utility’s well-test record.' },
  { id: 'nurse', label: 'A nurse from the clinic', brings: 'Brings the case map.' },
];

// topic: 'source' | 'data' | 'action'. holders: who can actually answer.
export const QUESTIONS = [
  { id: 'q1', text: 'What was in the water, and when did you know?', topic: 'source', holders: ['base', 'plant'], answer: 'Our own tests showed fuel compounds near the tank farm last spring. We should have told the town then. The results will be posted with the utility’s.' },
  { id: 'q2', text: 'Why can’t we see the test results?', topic: 'data', holders: ['utility'], answer: 'You should be able to. The two results over the limit were reported to the regulator, but not posted for residents. We can post every result monthly, starting this month.' },
  { id: 'q3', text: 'Why does the plant need to be over our wells?', topic: 'source', holders: ['plant'], answer: 'The plant was built before anyone mapped the aquifer. Moving it isn’t possible this year, but the fuel storage could move off the recharge area.' },
  { id: 'q4', text: 'What can students do this month?', topic: 'action', holders: ['nonprofit', 'teacher'], answer: 'Help us collect tap samples at the same homes every week and log the dates. Regular samples from the same taps are what make a pattern visible.' },
  { id: 'q5', text: 'How many kids from the six streets have come in sick?', topic: 'data', holders: ['nurse'], answer: 'More than from the rest of town combined, mostly stomach complaints, and the pins sit right below the hill. We’ve shared the map with the health department.' },
  { id: 'q6', text: 'Can the town vote to require monthly test results?', topic: 'action', holders: ['mayor'], answer: 'Yes. I can bring that measure to the next council session, and with this room behind it, it has the votes.' },
  { id: 'q7', text: 'Where exactly are the fuel tanks, and how old are they?', topic: 'source', holders: ['base', 'plant'], answer: 'There are three tanks on the hill, the oldest from the 1980s. I’ll bring the inspection dates to the next meeting.' },
  { id: 'q8', text: 'Will you pay for independent monitoring wells?', topic: 'source', holders: ['base', 'plant'], answer: 'I can’t promise tonight, but I’ll put the request in writing to the people who can approve it, and copy the mayor.' },
  { id: 'q9', text: 'Is the clinic’s water station safe to drink from?', topic: 'data', holders: ['nurse', 'utility'], answer: 'Yes. It’s filled from outside the six streets and tested every week. Use it until the tap results come back clean.' },
  { id: 'q10', text: 'When will the well reopen?', topic: 'data', holders: ['utility'], answer: 'Not until the source is found and the results are under the limit for several months in a row. Finding the source is what speeds that up.' },
  { id: 'q11', text: 'Who tests the water besides the operator?', topic: 'data', holders: ['nonprofit', 'utility'], answer: 'We send samples to an outside lab, separate from the operator’s own testing. Two independent results are harder to argue with than one.' },
  { id: 'q12', text: 'What can my family do today?', topic: 'action', holders: ['nurse', 'nonprofit'], answer: 'Use the clinic’s water station for drinking and cooking, and come in if anyone is sick for more than a day.' },
];

// What everyone else says when the question isn't theirs to answer.
export const DEFLECT = {
  friend: 'I don’t know — but I’ll make sure the street hears the answer.',
  mayor: 'That one isn’t mine to answer. I’ll make sure the people who can answer it do, on the record.',
  teacher: 'I don’t know, but my class can help find out.',
  plant: 'I can only speak for the plant’s site.',
  base: 'I can only speak for the base’s site.',
  nonprofit: 'We don’t have that information — the people who run the site do.',
  utility: 'That’s outside the utility’s records.',
  nurse: 'I can only tell you what we see at the clinic.',
};

export const REFLECTIONS = [
  { id: 'who', label: 'Who is responsible' },
  { id: 'unknown', label: 'What is still unknown' },
  { id: 'next', label: 'What happens next' },
];
