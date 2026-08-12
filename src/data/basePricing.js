// Source: media/Schottenstein_Base_Pricing_8.3.26.xlsx (revision 8.3.2026).
// Elevation and foundation variants are consolidated into one entry per base design.
export const communityPlanData = {
  'jerome-village-aster': [
    { name: 'Carroll II', price: 549900, sqft: '2,323' },
    { name: 'Erie II', price: 591900, sqft: '2,994' },
    { name: 'Franklin II', price: 557900, sqft: '2,791' },
    { name: 'Knox II', price: 549900, sqft: '2,111' },
    { name: 'Madison II', price: 554900, sqft: '2,699' },
    { name: 'Seneca II', price: 601900, sqft: '2,969' },
    { name: 'Summit II', price: 589900, sqft: '2,916' },
    { name: 'Trumbull II', price: 589900, sqft: '2,916' },
    { name: 'Vinton II', price: 577900, sqft: '2,898' },
  ],
  'cottages-at-verbena': [
    { name: 'Reed', price: 532900, sqft: '2,317–2,428' },
    { name: 'York', price: 491900, sqft: '1,863–2,385' },
  ],
  'glacier-pointe': [
    { name: 'Addison', price: 559900, sqft: '2,621' },
    { name: 'Chester', price: 501900, sqft: '1,760–2,364' },
    { name: 'Columbia', price: 449900, sqft: '1,815' },
    { name: 'Hanover', price: 504900, sqft: '1,770–2,389' },
    { name: 'Knox', price: 534900, sqft: '2,111' },
    { name: 'Reed', price: 548900, sqft: '2,271–2,428' },
    { name: 'York', price: 517900, sqft: '1,863–2,389' },
  ],
  'hickory-creek': [
    { name: 'Athens', price: 405900, sqft: '1,848' },
    { name: 'Benton', price: 430900, sqft: '1,847' },
    { name: 'Columbia', price: 425900, sqft: '1,815' },
    { name: 'Fayette', price: 491900, sqft: '2,110' },
    { name: 'Franklin', price: 486900, sqft: '2,561' },
    { name: 'Harrison', price: 438900, sqft: '2,065' },
    { name: 'Hayes', price: 469900, sqft: '2,264' },
    { name: 'Hudson', price: 423900, sqft: '1,600' },
    { name: 'Jefferson', price: 492900, sqft: '2,781' },
    { name: 'Madison', price: 494900, sqft: '2,699' },
    { name: 'Richland', price: 477900, sqft: '2,323–2,402' },
    { name: 'Stillwater', price: 457900, sqft: '2,045' },
    { name: 'Stillwater Plus', price: 471900, sqft: '2,198' },
    { name: 'Vinton', price: 499900, sqft: '2,898' },
  ],
  'holton-run': [
    { name: 'Hayes', price: 477900, sqft: '2,264' },
    { name: 'Richland', price: 488900, sqft: '2,323' },
  ],
  'renner-park': [
    { name: 'Athens', price: 412900, sqft: '1,848–1,968' },
    { name: 'Benton', price: 422900, sqft: '1,847' },
    { name: 'Columbia', price: 425900, sqft: '1,815' },
    { name: 'Fayette', price: 495900, sqft: '2,111' },
    { name: 'Franklin', price: 495900, sqft: '2,561' },
    { name: 'Hayes', price: 478900, sqft: '2,264' },
    { name: 'Hudson', price: 428900, sqft: '1,505' },
    { name: 'Madison', price: 500900, sqft: '2,699' },
    { name: 'Richland', price: 491900, sqft: '2,323–2,402' },
    { name: 'Seneca', price: 551900, sqft: '2,969' },
    { name: 'Stillwater', price: 463900, sqft: '2,045' },
    { name: 'Stillwater Plus', price: 478900, sqft: '2,198' },
    { name: 'Vinton', price: 525900, sqft: '2,898' },
  ],
  'retreat-at-hickory-lakes': [
    { name: 'Fayette', price: 531900, sqft: '2,110' },
    { name: 'Franklin', price: 530900, sqft: '2,561' },
    { name: 'Hayes', price: 504900, sqft: '2,264' },
    { name: 'Hudson', price: 469900, sqft: '1,600' },
    { name: 'Jefferson', price: 538900, sqft: '2,781' },
    { name: 'Madison', price: 534900, sqft: '2,699' },
    { name: 'Richland', price: 529900, sqft: '2,323–2,402' },
    { name: 'Seneca', price: 592900, sqft: '2,970' },
    { name: 'Stillwater', price: 501900, sqft: '2,045' },
    { name: 'Stillwater Plus', price: 510900, sqft: '2,198' },
    { name: 'Vinton', price: 544900, sqft: '2,898' },
  ],
  'reserve-at-new-california': [
    { name: 'Erie', price: 619900, sqft: '2,994' },
    { name: 'Franklin', price: 582900, sqft: '2,791' },
    { name: 'Jefferson II', price: 579900, sqft: '2,781' },
    { name: 'Knox', price: 587900, sqft: '2,533' },
    { name: 'Seneca', price: 619900, sqft: '2,969' },
    { name: 'Vinton', price: 599900, sqft: '2,898' },
  ],
}

const sqftBounds = (value) => value.split('–').map((part) => Number(part.replace(/,/g, '')))

export const inventoryPlanData = Object.entries(communityPlanData).reduce((plans, [community, communityPlans]) => {
  communityPlans.forEach((plan) => {
    const existing = plans.get(plan.name)
    const [minimumSqft, maximumSqft = minimumSqft] = sqftBounds(plan.sqft)
    if (!existing) {
      plans.set(plan.name, { ...plan, minimumSqft, maximumSqft, communities: [community] })
      return
    }
    existing.price = Math.min(existing.price, plan.price)
    existing.minimumSqft = Math.min(existing.minimumSqft, minimumSqft)
    existing.maximumSqft = Math.max(existing.maximumSqft, maximumSqft)
    existing.communities.push(community)
  })
  return plans
}, new Map())

export const inventoryPlans = [...inventoryPlanData.values()]
  .map(({ minimumSqft, maximumSqft, ...plan }) => ({
    ...plan,
    sqft: minimumSqft === maximumSqft
      ? minimumSqft.toLocaleString('en-US')
      : `${minimumSqft.toLocaleString('en-US')}–${maximumSqft.toLocaleString('en-US')}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))
