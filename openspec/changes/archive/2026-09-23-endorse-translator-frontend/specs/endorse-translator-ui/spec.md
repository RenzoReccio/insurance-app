## ADDED Requirements

### Requirement: Dual Input Modes for Endorsement Payload
The application SHALL provide users with two interchangeable input modes: an interactive form with structured input controls, and an editable raw JSON editor with syntax validation.

#### Scenario: Switching between form and JSON input
- **WHEN** user modifies fields in the visual form and switches to raw JSON mode
- **THEN** system synchronizes the edited values and reflects them immediately in the JSON editor

#### Scenario: Editing raw JSON directly
- **WHEN** user types or pastes valid JSON into the raw JSON editor and submits
- **THEN** system parses and sends that payload to the translation service

### Requirement: Preset Scenarios Selection
The application SHALL provide preloaded scenario presets for rapid evaluation of happy path and edge-case behavior.

#### Scenario: Loading happy path scenario
- **WHEN** user selects the "Rumbo - Happy Path" preset
- **THEN** system populates the input payload with the standard example matching the  specification

#### Scenario: Loading default values scenario
- **WHEN** user selects the "Defaults Injection" preset
- **THEN** system populates the input payload omitting optional fields to demonstrate template default fallbacks

#### Scenario: Loading error scenarios
- **WHEN** user selects "Missing Required Field" or "Unregistered Product" presets
- **THEN** system populates corresponding inputs and displays appropriate HTTP 400 or 404 error banners upon execution

### Requirement: Automated JWT Authentication Management
The application SHALL manage JWT access tokens automatically, authenticating on application load and attaching Bearer tokens to translation requests.

#### Scenario: Automated token acquisition
- **WHEN** the application loads in the browser
- **THEN** system calls `/v1/auth/token`, stores the received JWT in state/local storage, and marks the authentication status as active

#### Scenario: Manual re-authentication
- **WHEN** user clicks the "Refresh Token" action in the header
- **THEN** system requests a fresh token and updates the token display badge

### Requirement: Structured Output Inspector and Dynamic Data Table
The application SHALL render the returned Core JSON payload with syntax highlighting, one-click copy, and an ordered breakdown table of `dynamicData`.

#### Scenario: Viewing translated response
- **WHEN** the translation endpoint responds with HTTP 200
- **THEN** system renders the hierarchical Core JSON with copy-to-clipboard functionality and displays an ordered table of the 12 dynamic data fields showing their source and value

### Requirement: Multi-Module Navigation Architecture
The application SHALL provide a tabbed executive dashboard housing the Endorsement Translator module and a placeholder for the Optimal Route Dispatcher.

#### Scenario: Switching between modules
- **WHEN** user clicks on the "Optimal Route Dispatcher" tab
- **THEN** system displays the preview module for Exercise 2 with status indicators
