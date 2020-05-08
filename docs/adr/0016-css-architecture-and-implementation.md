# CSS Architecture and Implementation

- Status: proposed
- Deciders: Jody Heavener, Lauren Zugai, Danny Coates
- Date: 2020-05-07

## Context and Problem Statement

The [Settings Redesign project](https://github.com/mozilla/fxa/issues/3740) provides us with an opportunity to review how FxA approaches and employs CSS, both while building out new components for this project and for FxA going forward.

This ADR serves to determine how we'll approach our CSS architecture, such as utilizing libraries and frameworks to aid in development, and implementation, such as how we'll translate design work to code. It is part 2 of two [Settings Redesign CSS ADRs](https://github.com/mozilla/fxa/issues/5087); part 1, detailing how we'll approach build conventions and variables, [can be found here](https://github.com/mozilla/fxa/blob/master/docs/adr/0015-use-css-variables-and-scss.md).

When it comes to the implementation question we need to decide how we'll approach class naming conventions, color and measurement standards, interoperability across shared components, and any configuration needed to set any dependent library or framework (as applicable). Attention will also be paid to how the chosen option works with the Settings Redesign's design characteristics. Noteably:

- The new design uses space measurements in increments of 8px.
- [Colors](https://protocol.mozilla.org/fundamentals/color.html) are based in Mozilla Protocol's design system, where a hue's brightness scales in increments of 10.

## Decision Drivers

- **Reusability** - does the approach yield DRY, lean code that can be reused and repurposed?
- **Longevity** - will the approach be supported in next few years, and will it provide a stable platform for years of revolving HTML through added features and bug fixes?
- **Developer experience** - are some team members already familiar with the approach, making the transition easier than an unfamiliar one?
- **Ease of use** - will the choice result in a large learning curve or be easy for engineers to pick up?

## Considered Options

- Option A - Use an existing UI library
- Option B - Use an existing utility framework
- Option C - Develop our own hybrid component and utility framework
- Option D - Free-style with no/loose structure

## Decision Outcome

Chosen options: "Option B" with Tailwind CSS for the majority, and implementation details from "Option D" for special cases, because:

- Why not

## Pros and Cons of the Options

### Option A - Use an existing UI library

Use an existing third-party UI library that provides prebuilt components such as cards, form elements, loaders, various grid and section layouts, and modals, which we would then adjust to suit the needs of our design.

This could include libraries such as [Semantic UI](https://semantic-ui.com/), [Tailwind UI](https://tailwindui.com/), [Bootstrap](https://getbootstrap.com/), [Bulma](https://bulma.io/), or [Pure.css](https://purecss.io/).

Pros:

- A lot of the work is done for us; less time spent creating custom styles.
- Certain libraries provide us with the option to configure base styles and integrate with your build system.
- Most have drop in React subsets that would allow us to utilize UI styling and corresponding markup as proper React components.
- Most come with SASS/SCSS files to allow for customization.

Cons:

- Won’t cover 100% of our design needs and possibly even less so than other options, which would lead to us needing to create custom styles or classes from scratch or _also_ use a utility framework.
- Likely has the highest learning curve out of all considered options. This would require developers to know what already exists for use, likely causing constant documentation checks or searching for what’s available. An IDE extension could possibly ease this burden slightly, depending on the popularity of the chosen library.
- Will almost certainly come with features/components that we will not make use of, though this could possibly be alleviated with a tool like PurgeCSS.
- Introduces at least one more dependency to our stack. In fact, because some components would be shared and some would be project-specific it's likely that this dependency would exist in multiple areas of the repo.
  - If opting to use a React subset of the library it would also be likely that we'd need to install its TypeScript definitions to facilitate proper testing.
- As some of these libraries include JavaScript to make components fully functional (e.g. accordions, tabs) we would likely need to have the security team vet it.

**Implementation details:**

- Class names: UI libraries generally come with predefined class names that you can apply directly to elements. In the case of prebuilt React components we would simply render them with any applicable props, eliminating our interaction with class names altogether.
- Colors: most UI libraries provide you with the option to define primary and accent colors through accompanying preprocessor or other configuration files. Those that didn't would likely not be considered for use.
- Shared components: use of a UI library would restrict usage to projects that had the dependenc[ies] installed. Any library React components would need to have accompanying tests.
- Configuration: each UI library has its own way to configure base styles and tailor usage. Of the considered libraries these are the general breakdowns.
  - [Bootstrap](https://getbootstrap.com/docs/4.4/getting-started/theming/), [Bulma](https://bulma.io/documentation/customize/concepts/), and [Semantic UI](https://semantic-ui.com/usage/theming.html) can all be customized through preprocessor variables (Semantic UI uses LESS, which we don't intend on supporting).
  - Tailwind UI is unknown at this point (still in early access), but because it relies on [Tailwind CSS](https://tailwindcss.com/docs/configuration/) it's likely that this would be configured via a JavaScript file at the root of the project.

### Option B - Use an existing utility framework

Use an existing third-party utility framework that provides single-purpose classes that can be combined to incrementally style an element.

This could include frameworks such as [Tachyons](http://tachyons.io/), [Basscss](https://basscss.com/), [Tailwind](https://tailwindcss.com/), or [Beard](http://buildwithbeard.com/). Our team has looked through the available frameworks and lean towards making use of Tailwind.

Pros:

- Provides us with single-purpose class names for most conceivable CSS styles, that we can apply as needed to an element in order to build up its styles.
- Certain frameworks provide us with the option to configure base styles and integrate with your build system.
- Because it removes the traditional descriptive class name in favor of style-specific class names, competing and deeply-nested selectors are not of concern.
- Some of the team has experience, and early surveying indicates this could a well-received approach.

Cons:

- Much like Option A this approach would also require our developers to have some knowledge of what's available to them, such as each style's corresponding class name. Though this is less of a concern because generally each CSS property is mapped to a class name, and is aided by following size and unit patterns across class names. As well, an IDE extension could be used to help in development.
- Generally, each individual style is applied by a single class, so for a highly-styled element it can lead to a set of long, unwieldy class names.
  - E.g. Tachyons: `bg-white black-70 ph3 ph5-ns pv5 pv6-ns bt b--black-10`
  - E.g. Tailwind: `shadow-lg code-white text-sm font-mono subpixel-antialiased bg-gray-800 px-5 pb-6 pt-4 rounded-lg leading-normal overflow-hidden`
  - E.g. Basecss: `h6 caps bold inline-block py1 color-inherit text-decoration-none hover-underline`
- Introduces at least one more dependency to our stack. In fact, because some components would be shared and some would be project-specific it's likely that this dependency would exist in multiple areas of the repo.

**Implementation details:**

- Class names: as the main purpose of utility frameworks is to provide classes for styling we effectively would not need to write our own classes with this option.
- Colors: most utlity frameworks provide you with the option to define primary and accent colors through accompanying preprocessor or other configuration files. Those that didn't would likely not be considered for use.
- Shared components: use of a utility framework would restrict usage to projects that had the dependenc[ies] installed.
- Configuration: each utility framework has its own way to configure base styles and tailor usage. Of the considered framework these are the general breakdowns.
  - [Tailwind CSS](https://tailwindcss.com/docs/configuration/) is configured via a JavaScript file at the root of the project.
  - Tachyons is not directly configurable, but a [seperate generator](https://github.com/tachyons-css/generator) is available to generate a custom set of classes.
  - Basscss can be customized via [custom SASS builds](https://basscss.com/v7/docs/guides/custom-builds/) _or_ via [CSS Properties](https://basscss.com/v7/docs/guides/future-css/).
  - Beard is minimally customizeable via [SASS variables](http://buildwithbeard.com/configuration/).

### Option C - Develop our own hybrid UI and utility library

Develop a purpose-built CSS library containing a handful of utility classes and UI components we know we'll be using within our project, while free-styling the rest.

Pros:

- Allows us to tailor a set of styles to suit our project's needs. We can create UI components and helper classes that match, to the exact pixel, what is set out in designs, leaving out any cruft that an existing library would otherwise be packaged with our project.
- Gives us the best of both worlds; purpose-built UI components where suitable and lightweight utility classes where an entire component is not needed.
- Does not require our developers to learn a new styling convention (but may require some existing knowledge of what's available in the library).
- No additional third-party dependencies added to the stack.

Cons:

- Requires us to set aside time specifically for creating the initial set of styles.
- Requires developers to become familiar with an entirely new library; that is to say, there is zero chance of prior experience with it. They would also need to decide whether or not what they're developing should be added to the library or kept as a one-off style.
- The library that is created to suit the needs of one project, in this case the Settings Redesign, may not be suitable for other or future FxA projects, requiring us to go in and either refactor what's already written, or write new styles, which effectively defeats the purpose of this option.

**Implementation details:**

This option provides us with the ability to determine our own implementation details. Please refer to Option D.

### Option D - Free-style with no/loose structure

The "style-as-we-go" approach, where styles are generally written as needed for one-time use, possibly following a class name convention, but no formal library or framework is employed.

Pros:

- Little to no immediate setup requirements.
- Out of gate styles are tailored to suit the project's exact needs. We are free to make decisions as we see fit. Don't let the "man" bring us down.
- Allows us to decide our approach class naming conventions, such as ACSS, BEM, OOCSS, etc.
- Would likely see the least friction across our team.
- No additional third-party dependencies added to the stack.

Cons:

- Unless borrowing from existing styles or inheriting parent styles, styles need to be written from scratch.
- Has the potential, even likelihood, that styles will become convoluted down the road. This could lead to unwieldy selector depth, competing rulesets/use of `!important`, hard-to-manage SASS `@extends`, and poor readability, among other things.
- What is written for one project, in this case the Settings Redesign, may not be translate well to other or future FxA projects.

**Implementation details:**

- Class names: [! needs decision !] as a team we are more inclined to write descriptive class names as needed, but under a more structured approach we would probably do well using a OOCSS class name convention.
- Colors: the design team has suggested that we use color naming conventions inline with Protocol, which is to define the color name and lightness from 05 to 90 (e.g. `$color-blue-50`).
- Font size naming: [! needs decision !] we'll likely want to stick with a predefined set of abbreviated size descriptors (e.g `$font-size-xl`).
- Non-unit scales: [! needs decision !] to remain consistent with colors we'll likely want to set non-unit scaling (such as `z-index`) to increments of 10 (e.g. `z-index: 10 | 20 | 30`).

## Links

[TODO: add links]
