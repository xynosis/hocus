export interface TaskTemplate {
  id: string
  label: string
  subtasks: string[]
}

export const taskTemplates: TaskTemplate[] = [
  {
    id: 'essay',
    label: 'Write an essay / report',
    subtasks: [
      'Define the topic and scope',
      'Research and gather sources',
      'Write an outline',
      'Write a first draft',
      'Review and edit',
      'Final proofread',
    ],
  },
  {
    id: 'event',
    label: 'Plan an event',
    subtasks: [
      'Set the date and location',
      'Write the guest list',
      'Send invitations',
      'Arrange food and drinks',
      'Confirm attendance',
      'Prepare on the day',
    ],
  },
  {
    id: 'paperwork',
    label: 'File paperwork / admin task',
    subtasks: [
      'Gather all required documents',
      'Read through the requirements',
      'Complete each section',
      'Double-check for errors',
      'Submit or file',
    ],
  },
  {
    id: 'meeting',
    label: 'Prepare for a meeting',
    subtasks: [
      'Review the agenda',
      'Gather relevant notes or documents',
      'Write down questions to ask',
      'Prepare anything to present',
      'Send any prep materials to attendees',
    ],
  },
  {
    id: 'form',
    label: 'Complete a form or application',
    subtasks: [
      'Read through the full form first',
      'Gather supporting information',
      'Fill in each section',
      'Review before submitting',
      'Submit and save confirmation',
    ],
  },
  {
    id: 'clean',
    label: 'Clean or organise a space',
    subtasks: [
      'Clear everything out first',
      'Sort into keep, donate, discard',
      'Clean the empty space',
      'Put back only what belongs',
      'Deal with the donate and discard piles',
    ],
  },
]