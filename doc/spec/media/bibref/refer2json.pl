#!/usr/bin/perl

use strict;
use warnings;

# use LWP::UserAgent;
use Path::Class qw(file);
use JSON::XS;

sub genIntermediate {
    my $cnt = file("biblio.ref")->slurp();
    my @refs = ($cnt =~ m/^%L\s+(.*)\s*$/gm);
    my $html = "<html><head><title>Faux-Spec</title></head><body><p>" .
               join("\n", map { "[[$_]]" } @refs) .
               "</p><h2 class='no-num'>References</h2><h3 class='no-num'>Normative references</h3><!-- normative -->" .
               "<h3 class='no-num'>Other references</h3><!-- informative --></body></html>";
    open my $f, ">:utf8", "intermediate.html" or die "OOPS! $!";
    print $f $html;
    close $f;    
}

sub html2json {
    my $cnt = file("biblio.html")->slurp();
    my @snips = split /\s+<!---->\s+/, $cnt;
    # print join("\n#######################\n", @snips[2..$#snips-1]);
    my %refs;
    for my $ref (@snips[2..$#snips-1]) {
        $ref =~ m/<dt [^>]+>\[([^\]]+)\].*<dd>(.*)<\/dd>/s;
        print "Parse issue for:\n$ref\n" unless defined $1;
        $refs{$1} = $2;
    }
    my $json = JSON::XS->new->utf8->pretty->encode(\%refs);
    open my $f, ">:utf8", "biblio.js" or die "OOPS! $!";
    print $f $json;
    close $f;    
}

# genIntermediate();
html2json();

# extract all %L
# generate an HTML document that uses them all
# submit it to http://www.w3.org/Style/Group/css3-src/bin/postprocess-text
# extract each citation and convert it to a piece of JSON that is essentially "%L": "HTML content of dd"
# save JSON as var respec.bibref = JSON


