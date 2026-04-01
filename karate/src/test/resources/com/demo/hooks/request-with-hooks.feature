@ignore
Feature: Plantilla — precondición + request (postcondición explícita en el escenario)
  # Requiere en el caller: httpMethod, pathSuffix; opcional: payloadPath
  # Tras el call, el escenario puede leer response.id y llamar a delete-pet o after-request.

  Scenario:
    * call read('classpath:com/demo/hooks/before-request.feature')
    * url baseUrl
    * path pathSuffix
    * request requestBody
    * method httpMethod
