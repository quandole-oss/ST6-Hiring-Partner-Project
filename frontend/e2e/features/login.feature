Feature: Weekly Commit Module — Authentication
  As a member of the Platform Squad
  I want to sign in with my email and password
  So that I can access my weekly commits

  Background:
    Given I am on the login page

  Scenario: Valid credentials sign me into the dashboard
    When I fill in "alice@example.com" for email
    And I fill in "password123" for password
    And I submit the login form
    Then I should see the dashboard

  Scenario: Authenticated user can browse the RCDO hierarchy
    Given I am signed in as "alice@example.com"
    When I navigate to the RCDO page
    Then I should see a rally cry in the list
