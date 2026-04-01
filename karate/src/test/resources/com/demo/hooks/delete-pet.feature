@ignore
Feature: Eliminar mascota por ID (teardown)

  Scenario:
    * url baseUrl
    * path 'pet', petId
    * method delete
    * configure continueOnStepFailure = true
