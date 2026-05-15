export const featureFlags = {
  aiExperienceEnabled: false,
  threeDExperienceEnabled: true,
  venueFilterEnabled: true
}

export const isFeatureEnabled = (flagName) => Boolean(featureFlags[flagName])
