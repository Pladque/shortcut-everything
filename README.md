# shortcut-everything
### Check [New version of extension!](https://github.com/Pladque/Shortcut-Everything2.0)
### Current version: v0.7.5
A chrome extension that allows you to create shortcut on websites and improve your workflow!


# Tips
 - While adding shortcut, make sure to click on element that is specific, so algorythm will be able to find it (in most cases clicking in the middle is the best)
 - Sometimes elements may be very different inside, even though they look nearly the same on the surface. In such a cases your shortcut may not always work ( but in the nearest future there will be implemement solution for that!)
 - Make sure you are not overwriting defoult shortcuf for website. If site already implemented any action for key, using it in your shortcut may cause some unexpected behaviors!
 - If you are using packages, keep in mind that some shortcuts are using (only) text from website to find an element. If you are using different languge, shortcut may not work for you. You can either add such a shortcut by yourself of modify package by changing "innerText" field. 
 - In popup and setting, at very top of page you can see additional information (after some action, for example when adding new shortcut)



# Q&A
## 0. Link to webstore???
 https://chrome.google.com/webstore/detail/shortcuteverything/kpedjgbpcmaklfalckchgjaehejgmfoi?hl=pl
## 1. How to add shortcut
  Click on big button with "Add". Then, eneter your key sequence (you can see current key sequence in field below "Current Key Sequence"). Once you do this, click "ENTER" (enter key cannot be part of shortcut!!). Once popup is closed (should close after "enter") click on element you want to be shortcutted. Make sure you are following rules listed in "Tips" above
## 2. My shortcut doesn't work, why?

  a) Is there a message that "connot find element"?
  If yes - read b)
    
   If no - It looks like alhorythm found other element with same properties. Try one of the below solution:
    
   i) try to click in slightly diffrent place of element you want to be shortcutted. 
        
   ii) If similar element is beeing clicked, insead of one you shortcutted, try changing index of yout shortcut. Just input 1 in field before button "change index" in popup (incement this value unit it works)
   
   iii) Click button "on/off Inner Text" 
        
  b)  Why I see alert "cannot find element"?
  
   it means, that alghorythm cannot find element with saved properties. You 2 options:
   
   i) If shortcut works only on single(few) website(s) - try using "improve button"
        
   ii) If you noticed, that element is changing how it looks like while you are holding mouse above it, try incement value in the field before button "update skippable attr count". 
        
## 3. I don't understand meaning of some of the buttons
  Keep in mind that it is one of the first versions of this extension. Undescibed buttons may not work.
  
## 4. How to asign shortcut to sub web page. For example I want to my shortcut work only on ```www.XYZ.com/ABC``` instead of the whole ```www.XYZ.com```
Right now it is not possible. 

        
        
# How to use...
## Improve button
Websites often have saved some degug data inside html elements, value, and sometimes even attribiut name changes with every reload. To make shortcut work, you have to mark some fields as "not important", so alghorythm will wkip them during search. To do that, you have to simply "add" your shortcut twice. 

How to use
First, add as usual, with "+" button. Then, reload website (or go to website where shortcut doesnt work, bnut should) and click "imporve" button in popup. Lastly, hit "ESC" to close popup and click element you want to be shortcuttet again (please try to click in the same place as first time!). Refresh page and try it again. 


## Skippable attrs amount
Determiantes how many attribiutes alghorythm can skipp (not consieder) while searchiing for element. Useful if tehre is some kind of "on hover" action, that changes element's attribiutes. Even if you enter some big number (like  9999) alghorythm is going to choose element that satisfies greates aomunt of attribiutes.

How to use
Incement value in last input field (one before "update skippable attr count" button) and hit that button. Refresh page and check if it works. 

## Index of shortcut
If there are similar elemetns on website, anbd you want to "click" secound one, you can increase shortcuts index from 0 to 1 to get this one. 
In order to get last element, use -1, to get element before last elment use -2, and so on...

## Delete button
Deletes chosen shortcut. 

## Update shortcut button
allows to change key sequence of existing shortcut. If sucha a sequence already exists, will be overwritten.

## Has to be visible button (beta)
In process of searching for matching element, consider only elements, that are currently on the screen. Still needs some fixes, doesnt work perfect. 

## Reset storage
Deletes all shortcuts from every website.

## Show Shortcuts Raw
Shows stored data for current website.


