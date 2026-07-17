const NUTS_URL = 'https://ec.europa.eu/eurostat/web/nuts/overview'

export const facilityDetailsContent = {
  en: {
    pageTitle: 'Facility details',
    heading: 'Facility details',
    fields: {
      name: 'Name',
      activity: 'Activity',
      ippcCode: 'IPPC code',
      address: 'Address',
      coordinates: 'Coordinates (Lat, Lon)',
      nutsRegion: 'NUTS region',
      naceCode: 'NACE code',
      riverBasin: 'River basin',
      nationalId: 'National ID'
    },
    notAvailable: '—',
    explainers: [
      {
        heading: 'What is the IPPC code?',
        body: "IPPC code refers to a classification value used to identify specific industrial or agricultural processes regulated under the European Union's Integrated Pollution Prevention and Control (IPPC) Directive (96/61/EC and later 2008/1/EC)."
      },
      {
        heading: 'What is the NUTS region?',
        bodyStart:
          'To reference countries’ regions for statistical purposes, the EU has developed a classification known as ',
        link: {
          text: 'NUTS or the Nomenclature of territorial units for statistics (opens in new tab)',
          href: NUTS_URL
        },
        bodyEnd: '.'
      },
      {
        heading: 'What is the NACE code?',
        body: "The 'statistical classification of economic activities' in the European Community, abbreviated as NACE."
      },
      {
        heading: 'What is the National ID?',
        body: 'A unique identifier assigned to facilities and businesses that generate, store, transport, or dispose of hazardous waste. This identifier, often issued by national environmental regulatory authorities (like the Environment Agency in the UK or the EPA in the US/Ireland), allows for tracking the entire lifecycle of hazardous waste from generation to disposal.'
      }
    ]
  },
  cy: {
    pageTitle: 'Facility details --CY',
    heading: 'Facility details --CY',
    fields: {
      name: 'Name --CY',
      activity: 'Activity --CY',
      ippcCode: 'IPPC code --CY',
      address: 'Address --CY',
      coordinates: 'Coordinates (Lat, Lon) --CY',
      nutsRegion: 'NUTS region --CY',
      naceCode: 'NACE code --CY',
      riverBasin: 'River basin --CY',
      nationalId: 'National ID --CY'
    },
    notAvailable: '—',
    explainers: [
      { heading: 'What is the IPPC code? --CY', body: '--CY' },
      {
        heading: 'What is the NUTS region? --CY',
        bodyStart: '--CY ',
        link: { text: 'NUTS (opens in new tab) --CY', href: NUTS_URL },
        bodyEnd: '.'
      },
      { heading: 'What is the NACE code? --CY', body: '--CY' },
      { heading: 'What is the National ID? --CY', body: '--CY' }
    ]
  }
}
