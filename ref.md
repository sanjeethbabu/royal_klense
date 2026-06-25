WHAT IS THE ISSUE?
Your hero section has excessive blank/white space on the left side of the page. The dark navy background color does not extend across the entire width of the screen viewport. Instead, it leaves a visible gap on the left, making the layout look unbalanced and unprofessional.
The content (title, tagline, description) is also not utilizing the full available screen width properly, appearing cramped and misaligned.

WHY IS THIS HAPPENING?
Root Causes:

Browser Default Margins - Web browsers automatically add default margins to the body element, creating automatic spacing on all sides
Hero Container Not Full Width - The hero section container has been set to a width less than 100% (like 95% or a fixed pixel value) instead of using the complete viewport width
Extra Padding Applied - The hero section has padding values applied that push the content inward and reduce the available space
Alignment Issues - Content is not properly centered using modern CSS flexbox alignment techniques
Box Model Problems - The padding and width are not being calculated together properly, causing overflow and misalignment

and if i scroll footer the additioanl full line dragger is adding 


HOW TO OVERCOME IT?
Solution 1: Remove All Default Spacing
Remove all default margins and padding from the body element and all global elements. This eliminates the automatic browser spacing that creates the white gaps.


remove that line and make the that violet bg fit to page
