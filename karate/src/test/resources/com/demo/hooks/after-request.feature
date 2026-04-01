@ignore
Feature: Hook posterior a la petición HTTP
  # Si existe response.id (POST /pet), intenta DELETE para limpiar estado de demo.

  Scenario:
    * def petId = response.id
    * eval if (petId != null) karate.call('classpath:com/demo/hooks/delete-pet.feature', { petId: petId })
