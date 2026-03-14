export interface ProjectTemplate {
  id: string
  label: string
  tasks: string[]
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'software-launch',
    label: 'Software launch',
    tasks: [
      'Define scope and requirements',
      'Design phase',
      'Development',
      'Testing and QA',
      'Launch',
      'Post-launch review',
    ],
  },
  {
    id: 'event-planning',
    label: 'Plan an event',
    tasks: [
      'Set goals and budget',
      'Book venue',
      'Send invitations',
      'Arrange catering',
      'Prepare agenda',
      'Day-of coordination',
    ],
  },
  {
    id: 'website-redesign',
    label: 'Website redesign',
    tasks: [
      'Audit current site',
      'Define requirements',
      'Design mockups',
      'Development',
      'Content migration',
      'Launch',
    ],
  },
  {
    id: 'marketing-campaign',
    label: 'Marketing campaign',
    tasks: [
      'Define audience and goals',
      'Create content',
      'Set up channels',
      'Schedule posts',
      'Launch campaign',
      'Measure results',
    ],
  },
  {
    id: 'onboarding',
    label: 'New hire onboarding',
    tasks: [
      'Set up accounts and access',
      'First day welcome',
      'Week one training',
      'Introductions and meetings',
      '30-day check-in',
      '90-day review',
    ],
  },
  {
    id: 'research',
    label: 'Research project',
    tasks: [
      'Define research question',
      'Literature review',
      'Gather data',
      'Analyse findings',
      'Write up',
      'Review and submit',
    ],
  },
]
