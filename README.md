# Discount Optimizer Application

This application aims to provide an easy, practical solution to solve discount optimization problems.

The shop, which ordered that application, offers 4 discount levels, based on the total amount each custommers spent so far (ie: 1000€ spent grants a lifetime 10% discount).
Multiple discount levels can be reached within the same purchase, leading to the time consumming task of dispatching each product bought within the same purchase in the best order to reach the next discount level and optimizing the final price.

The app takes into account the custommer initial amount of money spent so far, the different products in the current pruchase, and the shop discount levels.
Technically, the algorythm will recusively generate every product subset possible to reach each next discount level, and pruning iteratively each unoptimized subset node.
