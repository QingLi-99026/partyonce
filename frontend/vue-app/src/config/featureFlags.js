export const featureFlags = {
  aiExperienceEnabled: false,
  threeDExperienceEnabled: false,
  venueFilterEnabled: true
}

export const isFeatureEnabled = (flagName) => Boolean(featureFlags[flagName])
