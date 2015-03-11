# How to contribute

We want to keep it as easy as possible to contribute and updates to Hoist Connect. 
There are a few guidelines that we need contributors to follow so that we can have a chance of keeping on top of things.

## Getting Started

* Make sure you have a [GitHub account](https://github.com/signup/free)
* Fork the repository on GitHub

## Making Changes

* Create a topic branch from where you want to base your work.
  * This is usually the master branch.
  * Only target release branches if you are certain your fix must be on that
    branch.
  * To quickly create a topic branch based on master; `git checkout -b
    feature/my_contribution master`. Please avoid working directly on the
    `master` branch.
  * branch names should follow a naming convention of bug/<issuenumber> or feature/<name>
* Ensure you follow the [style guide](https://github.com/hoist/javascript) for any changes 
* Make commits of logical units.
* Check for unnecessary whitespace with `git diff --check` before committing.
* Make sure your commit messages are in the proper format.
* Make sure you have added or modified at least one tests for your changes.
* Run _all_ the tests to assure nothing else was accidentally broken.

## Submitting Changes

* Push your changes to a topic branch in your fork of the repository.
* Submit a pull request to the repository in the hoist organisation

# Additional Resources

* [Hoist JavaScript Style Guide](https://github.com/hoist/javascript)
* [General GitHub documentation](http://help.github.com/)
* [GitHub pull request documentation](http://help.github.com/send-pull-requests/)
