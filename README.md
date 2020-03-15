# OWeekRegistration
Application to view Queen's Engineering Orientation Week Registration Information.

/server/server.js is the driver program that starts the express server. In localhost environments, is uses port 8080.
The program uses passport for user authentication, the key to passport is held in passport.ini, which is not
shown in this repo for security reasons, but must be present in /config.

## Routes

routes.js defines each get and post request and calls code in other modules to appropriately handle the routing requests.

### GET Routes

/ is the home route, it forwards to /filter or the home page that accesses the login screen.

/login is the screen where users can login via passport.

/user_management is a screen that shows each user and allows adding new ones or editing existing ones. This is admin only.

/user_delete is a screen where each user is seen and can be deleted. This is admin only.

/filter is a screen that displays registration information of any given individual.

/foodrestrictions is a screen that displays registration information of individuals under 18. This is admin only.

/age is a screen that displays registration information of individuals under 18.

/primer is a screen that displays registration information of individuals that requested an accessibility primer.

/medical is a screen that displays registration information of individuals that identified medical concerns. This is admin only.

/pronouns is a screen that displays registration information of individuals that identified as using non-binary pronouns. This is admin only.

/accessibility is a screen that displays registration information of individuals that identified accessibility concerns. This is admin only

/payPerson is a screen that displays registration information of individuals that identified they would pay in person.

/payOnline is a screen that displays registration information of individuals that identified they would pay online.

/payMail is a screen that displays registration information of individuals that identified they would pay by mail.

/unpaid is a screen that displays registration information of individuals that have not yet paid.

/search is a screen that displays registration information of individuals that match given parameters.

/netid is a screen that displays registration information of individuals that match the provided netid.

/all_groups is a screen that displays the groups and their men/women/total count. This is admin only.

/error is a screen that shows an error message for those that tried to access a screen they don't have the permissions for.

/logout logs th euser out and returns them to the home route.

### POST routes

/login uses passport to authenticate the user. Successful auth redirects to /filter, failure redirects to /login.

/sign_up adds a new user to the database. They must have a unique username.

/user_edit changes the information of a user, identified by username.

/user_delete removes a user from the database and refreshes the /user_delete screen.

/one_group displays the registration information of each individual in a specified group.

/update_max_num updates the database with the new maximum number in each group.

/assign processes each individual not yet assigned to a group and assigns them based on their identified pronouns to attempt a reasonable gender split in each group.

/clear_groups wipes all group data, except for the maximum number allowed in a group.

## Wufoo

### wufooConstants.js

The most critical piece for future years is the wufooConstants.js file. The exported objects in this file drive the
UI and what fields are shown to which users.

The _heading_ object is used to display each field in the website that users will need to be able to see.

The _allFields_ object converts the Wufoo ID for each form field to a readable english name. This is **EXTREMELY** important
to keep updated should the form change.

The _generalFields_ object is the same as _allFields_, except it is limited only to those fields that non-admins can view.
This means sensitive fields in the form should NOT be put in this object, so that only a select few can view that information.

The _groupFields_ object is used to reference forms fields that are used to filter entries and group incoming students.
For example, the age field, so that you can view who needs a specialized driver for Go Nutz.

The order of appearance of the fields in the above objects specify the order in which they appear in the UI. Also,
the payment status, payment types and comment fields should always appear last in the order they currently are written.
There are a few other objects in this file, but those only group data for ease of coding, for example sort directions, 
AND vs. OR grouping, and search operators.

### wufooApi.js

This file actually runs the API calls. It uses wufooQueryBuilder.js to provide exported pre-built queries for each filter options,
such as by age. Client code should use the query building functions for any custom queries.
The API requests use wufoo_properties.ini to authenticate and get the base URI. This file isn't shown
in the Github repo for security reasons, but for test or production environments, it must be held in the /config folder.

wufooApi.js provides three types of queries. The first is a prebuilt query that will find entries that have an ID
within the provided list of IDs. The second provided query is a general query controllable by a passed in query string,
but this query returns a paginated response. In addition to the number of entries (as defined by PAGE_SIZE), 
the "next page" and "previous page" are also returned. These are used to scale entries to get the next PAGE_SIZE entries.
The last query available is just a general query controlled by an inputted string, that only returns PAGE_SIZE entries
and will not allow access to the "next set" of entries.

Every query also makes a nested query to get any comments attached to an entry.

### wufooQueryBuilder.js

This file contains the code that translates a programmatic request for wufoo data into a Wufoo syntax API query.
The documentation for how queries are structured can be found [here](https://wufoo.github.io/docs/?javascript#).
Filter number, operator, and field are chained together for each query. 

## Database

This is a MySQL database. Authentication information for the database is held in db_properties.ini, which is not in this repo for security reasons.
This file must be present in /config/database.

The queries.js file holds many prebuilt queries along with one custom query available. All queries are parametrized for security purposes.

There are prebuilt SELECT queries, one general and one that allows one WHERE clause. These return all columns.

Similarly, there is an UPDATE query that updates any rows with the provided column data, and one that updates rows that satisfy the WHERE clause.

There is an INSERT query as well as a DELETE query that must have one WHERE clause.

## Views

.ejs files are used, which means client-side javascript can be written directly in with the HTML code.
This also means that any file within /views can be included into any other file in /views. This is done
with functions.ejs, where any repeated code (output table, search fields, navigation buttons, etc.) is held
within functions.ejs and then a Javascript function that outputs the HTML with appropriate JS logic is called.
There should be no duplicity between each .ejs file.